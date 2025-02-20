package main

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"log"
	"maps"
	"math/big"
	"os"
	"os/exec"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	common "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type IndexData struct {
	Index []float64   `json:"index"`
	Dates []time.Time `json:"date"`
	Hours []int       `json:"hours"`
	Time  []int       `json:"time"`
}

type City struct {
	Name          string `json:"name"`
	Data          IndexData
	Type          string  `json:"type"`
	Timezone      float64 `json:"timezone"`
	TimeDelay     int     `json:"timeDelay"`
	reminderCount int
}

type Record struct {
	Date  time.Time `bson:"Date"`
	Hour  int       `bson:"Hour"`
	Index float64   `bson:"Index"`
	Time  int       `bson:"Time"`
}

const CITIES_FILE = "cities.json"
const DB_NAME = "indexes2"

func sendDataAvailabilityReminer(today time.Time, city *City) {
	// This date is the max date essentially
	// NOT the current date
	mostRecentDate := city.Data.Dates[0]
	for _, date := range city.Data.Dates {
		if date.After(mostRecentDate) {
			mostRecentDate = date
		}
	}

	remainingHours := mostRecentDate.Sub(today).Hours()

	var reminderInterval int
	if remainingHours <= 48 {
		reminderInterval = 8
		city.reminderCount++
	} else if remainingHours <= 24 {
		reminderInterval = 4
		city.reminderCount++
	} else if remainingHours <= 6 {
		reminderInterval = 1
		city.reminderCount++
	} else {
		city.reminderCount = 0
		return
	}

	// Send notifications based on reminder interval and reminder count
	switch reminderInterval {
	case 1:
		// Always send a notification for critical reminders
		msg := fmt.Sprintf("APTOS RESOLVER WARNING: Only %.0f hours left with the current data set for %s. \n(Latest Time: %v)\n(Current Time: %v)\n", remainingHours, city.Name, mostRecentDate, today)
		fmt.Println(msg)
	case 4:
		if (city.reminderCount-1)%4 == 0 { // Send every 4th reminder
			msg := fmt.Sprintf("APTOS RESOLVER WARNING: Only %.0f hours left with the current data set for %s. \n(Latest Time: %v)\n(Current Time: %v)\n", remainingHours, city.Name, mostRecentDate, today)
			fmt.Println(msg)
		}
	case 8:
		if (city.reminderCount-1)%8 == 0 { // Send every 6th reminder
			msg := fmt.Sprintf("APTOS RESOLVER WARNING: Only %.0f hours left with the current data set for %s. \n(Latest Time: %v)\n(Current Time: %v)\n", remainingHours, city.Name, mostRecentDate, today)
			fmt.Println(msg)
		}
	}
}

func getTimeframes() []int {
	return []int{1, 2, 4, 6, 8, 24}
}

func readEnv() *[]City {
	citiesFile, err := os.ReadFile(CITIES_FILE)
	cities := new([]City)
	err = json.Unmarshal(citiesFile, &cities)
	if err != nil {
		log.Fatalf("Error reading JSON File: %v", err)
	}
	return cities
}

func getSigner(privateKeyStr string) common.Address {
	privateKey, err := crypto.HexToECDSA(privateKeyStr)
	if err != nil {
		log.Fatal(err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("cannot assert type: publicKey is not of type *ecdsa.PublicKey")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	return fromAddress
}

func getClient(rpcUrl string) *ethclient.Client {
	client, err := ethclient.Dial(rpcUrl)
	if err != nil {
		log.Fatal(err)
	}
	return client
}

func getTransactor(ethClient *ethclient.Client, privateKeyStr string) *bind.TransactOpts {
	privateKey, err := crypto.HexToECDSA(privateKeyStr)
	if err != nil {
		log.Fatalf("failed to load private key: %v", err)
	}
	//nonce, err := ethClient.PendingNonceAt(context.Background(), address)
	//if err != nil {
	//	log.Fatal(err)
	//}

	//gasPrice, err := ethClient.SuggestGasPrice(context.Background())
	//if err != nil {
	//	log.Fatal(err)
	//}
	chainID, err := ethClient.ChainID(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	transactor, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatalf("failed to create keyed transactor: %v", err)
	}
	return transactor

	// 4. Optional: Set transaction parameters
	//auth.GasLimit = uint64(300000) // Set gas limit
	//auth.GasPrice = big.NewInt(20000000000) // Set gas price (in wei)
	//auth.Value = big.NewInt(0) // Set value to send with transaction (in wei)
}

func getData(ctx context.Context, mongoClient *mongo.Client, wg *sync.WaitGroup, city *City) {
	defer wg.Done()
	var res []Record
	collection := city.Name + "_" + city.Type
	coll := mongoClient.Database(DB_NAME).Collection(collection)
	filter := bson.M{}

	cursor, err := coll.Find(ctx, filter)
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	// Iterate through the cursor and decode each document
	if err = cursor.All(context.TODO(), &res); err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Fetched. Processing...(%s)[%s]<%d>\n", city.Name, city.Type, len(res))

	var newData IndexData
	for _, record := range res {
		record.Date = time.Date(
			record.Date.Year(),
			record.Date.Month(),
			record.Date.Day(),
			record.Date.Hour(),
			record.Date.Minute(),
			record.Date.Second(),
			record.Date.Nanosecond(),
			time.Now().UTC().Location(),
		)
		// Adjust the hour and time based on the city's timezone
		record.Date = record.Date.Add(time.Hour * time.Duration(city.Timezone))
		record.Date = record.Date.Add(time.Hour * 24 * time.Duration(city.TimeDelay))
		record.Time = int(record.Date.Unix())

		//if record.Date.Unix() >= time.Now().Unix() {
		//	continue
		//}

		newData.Dates = append(newData.Dates, record.Date)
		newData.Hours = append(newData.Hours, record.Hour)
		newData.Index = append(newData.Index, record.Index)
		newData.Time = append(newData.Time, record.Time)
	}
	reorderData(&newData) // NOTE: Now not required?
	city.Data = newData
	fmt.Printf("Done(%s)[%s]<%d>\n", city.Name, city.Type, len(res))
}

func reorderData(data *IndexData) {
	// Create a slice of indices to track the original order.
	indices := make([]int, len(data.Dates))
	for i := range indices {
		indices[i] = i
	}

	// Sort the indices based on the Dates field.
	sort.Slice(indices, func(i, j int) bool {
		return data.Dates[indices[i]].Before(data.Dates[indices[j]])
	})

	// Create temporary slices to hold the sorted data.
	sortedDates := make([]time.Time, len(data.Dates))
	sortedHours := make([]int, len(data.Hours))
	sortedIndex := make([]float64, len(data.Index))
	sortedTime := make([]int, len(data.Time))

	// Reorder all slices based on the sorted indices.
	for i, idx := range indices {
		sortedDates[i] = data.Dates[idx]
		sortedHours[i] = data.Hours[idx]
		sortedIndex[i] = data.Index[idx]
		sortedTime[i] = data.Time[idx]
	}

	// Update the original slices with the sorted data.
	data.Dates = sortedDates
	data.Hours = sortedHours
	data.Index = sortedIndex
	data.Time = sortedTime
}

func updateCities(ctx context.Context,
	mongoClient *mongo.Client,
	cities *map[string]*City,
	currentTime *time.Time,
	adminAddress string) {
	for range time.Tick(time.Second * 10) {
		now := time.Now()
		if currentTime.Hour() != now.Hour() {
			var wg sync.WaitGroup
			fmt.Printf("Time change detected %d != %d\n", currentTime.Hour(), now.Hour())

			now := time.Now().UTC()
			// Update master currentTime
			today := time.Date(
				now.Year(),
				now.Month(),
				now.Day(),
				now.Hour(),
				0,
				0,
				0,
				now.UTC().Location(),
			)
			wg.Add(1)
			updateMasterTime(&wg, today.UTC().Unix(), adminAddress)

			// Separate WaitGroup for getData operations
			var dataWg sync.WaitGroup

			for key := range maps.Keys(*cities) {
				city := (*cities)[key]
				fmt.Printf("Updating data for %s...", city.Name)
				dataWg.Add(1)
				go getData(ctx, mongoClient, &dataWg, city)
				fmt.Printf("Done\n")
			}

			dataWg.Wait()
			cities_arr := readEnv()

			cmds := buildAptosCommands(adminAddress, cities_arr)
			for key := range maps.Keys(*cities) {
				city := (*cities)[key]
				updateOracleContract(cmds[city.Name])

				// Determine category ID based on city type
				var categoryId *big.Int
				if city.Type == "realestate" {
					categoryId = big.NewInt(0)
				} else {
					categoryId = big.NewInt(1)
				}

				currentValue := findCurrentValue(city)
				if currentValue == -1 {
					log.Fatal("Could not find today and the hour in findCurrentValue for ", city.Name)
				}
				value, err := convertFloatToInt(currentValue)
				if err != nil {
					log.Fatal("Could not convert float to int")
				}
				timeframes := getTimeframes()
				// Fill actual values for all players for each timeframe
				for timeframeIndex := uint64(0); timeframeIndex < uint64(len(timeframes)); timeframeIndex++ {
					cmd := fmt.Sprintf(`aptos move run --function-id %s::master::fill_actual_values_all --args "string:%s" "u8:%d" "u64:%d" "u64:%d" --profile default --assume-yes`,
						adminAddress,
						city.Name,
						categoryId,
						timeframes[timeframeIndex],
						int(value),
					)
					run_command(cmd)
				}
			}

			*currentTime = time.Now()
		}
	}
}

func initCities(ctx context.Context,
	mongoClient *mongo.Client,
	adminAddress string) map[string]*City {
	// Get the data for each city and set them in the struct
	var dataWg sync.WaitGroup
	ret := make(map[string]*City)
	cities := readEnv()
	for i := range *cities {
		city := &(*cities)[i]
		city.reminderCount = 0
		fmt.Printf("Fetching data for %s (%s)...\n", city.Name, city.Type)
		dataWg.Add(1)
		go getData(ctx, mongoClient, &dataWg, city)
		ret[city.Name+city.Type] = city
	}

	dataWg.Wait()
	now := time.Now().UTC()
	today := time.Date(
		now.Year(),
		now.Month(),
		now.Day(),
		now.Hour(),
		0,
		0,
		0,
		now.UTC().Location(),
	)
	var wg sync.WaitGroup
	wg.Add(1)
	updateMasterTime(&wg, today.UTC().Unix(), adminAddress)

	cmds := buildAptosCommands(adminAddress, cities)

	// Then update oracle contracts
	for key := range ret {
		city := ret[key]
		updateOracleContract(cmds[city.Name])

		// Determine category ID based on city type
		var categoryId *big.Int
		if city.Type == "realestate" {
			categoryId = big.NewInt(0)
		} else {
			categoryId = big.NewInt(1)
		}

		currentValue := findCurrentValue(city)
		if currentValue == -1 {
			log.Fatal("Could not find today and the hour in findCurrentValue for ", city.Name)
		}
		value, err := convertFloatToInt(currentValue)
		if err != nil {
			log.Fatal("Could not convert float to int")
		}
		timeframes := getTimeframes()
		// Fill actual values for all players for each timeframe
		for timeframeIndex := uint64(0); timeframeIndex < uint64(len(timeframes)); timeframeIndex++ {
			cmd := fmt.Sprintf(`aptos move run --function-id %s::master::fill_actual_values_all --args "string:%s" "u8:%d" "u64:%d" "u64:%d" --profile default --assume-yes`,
				adminAddress,
				city.Name,
				categoryId,
				timeframes[timeframeIndex],
				int(value),
			)
			run_command(cmd)
		}
	}
	//var wg sync.WaitGroup
	//wg.Add(1)
	//go updateMasterTime(&wg, now.Unix(), auth, ethClient, masterAddrStr)

	return ret
}

func convertFloatToInt(num float64) (int64, error) {
	// Convert to string with 2 decimal places
	s := fmt.Sprintf("%.2f", num)

	// Remove decimal point
	s = strings.ReplaceAll(s, ".", "")

	// Convert to integer
	result, err := strconv.Atoi(s)
	if err != nil {
		return 0, err
	}

	return int64(result), nil
}

func run_command(cmd string) {
	fmt.Println("Running...: %s", cmd)
	command := exec.Command("bash", "-c", cmd)
	output, err := command.CombinedOutput()

	// Check for errors
	if err != nil {
		fmt.Printf("Error executing command: %v\n", err)
		fmt.Printf("Command output: %s\n", string(output))
	} else {
		fmt.Printf("Command executed successfully. Output: %s\n", string(output))
	}
}

func updateMasterTime(wg *sync.WaitGroup, time int64, adminAddress string) {
	defer wg.Done()
	cmd := fmt.Sprintf(`aptos move run --function-id %s::master::update_time --args "u256:%d" --profile default --assume-yes`, adminAddress, time)
	run_command(cmd)
}

func findCurrentValue(city *City) float64 {
	now := time.Now().UTC()
	today := time.Date(
		now.Year(),
		now.Month(),
		now.Day(),
		now.Hour(),
		0,
		0,
		0,
		now.UTC().Location(),
	)

	if len(city.Data.Dates) == 0 {
		fmt.Println("No data available in the city struct.")
		return -1
	}

	sendDataAvailabilityReminer(today.UTC(), city)

	// Find the current value
	for i, date := range city.Data.Dates {
		if date.Compare(today) == 0 {
			return city.Data.Index[i]
		}
	}

	return -1
}

func buildAptosCommands(adminAddress string, cities *[]City) map[string]string {
	ret := make(map[string]string)
	for i := range *cities {
		city := (*cities)[i]
		var categoryId int
		if city.Type == "realestate" {
			categoryId = 0
		} else {
			categoryId = 1
		}
		currentValue := findCurrentValue(&city)
		value, err := convertFloatToInt(currentValue)
		if err != nil {
			log.Fatal("Could not convert float to int")
		}
		cmd := fmt.Sprintf(`aptos move run --function-id %s::oracle::set_value --args "u8:%d" "string:%s" "u64:%d" --profile default --assume-yes`,
			adminAddress,
			categoryId,
			city.Name,
			value)
		ret[city.Name] = cmd
	}
	return ret
}

func updateOracleContract(command string) {
	run_command(command)
}

func main() {
	ctx := context.Background()
	env, _ := godotenv.Read(".env")
	mongodb_uri := env["MONGODB_CONNECTION_URI"]
	_ = mongodb_uri

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongodb_uri))
	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			log.Fatal(err)
		}
	}()

	adminAddress := env["ADMIN_ADDRESS"]

	cities := initCities(ctx, client, adminAddress)
	currentTime := time.Now()
	_ = currentTime
	go updateCities(ctx, client, &cities, &currentTime, adminAddress)

	select {}
}
