
module admin::master {
    use admin::oracle;
    use std::signer;
    use std::vector;
    use std::aptos_hash;
    use aptos_std::table;
    use aptos_framework::event;

    const ECityAlreadyExists: u64 = 101;
    const ENotValidCity: u64 = 102;
    const ENotValidTimeframe: u64 = 103;
    const EOracleNotUpdated: u64 = 104;
    const ETimeTravel: u64 = 105;
    const EPositionNotResolvable: u64 = 106;
    const EPositionNotExist: u64 = 107;
    const EActualValueMissing: u64 = 108;
    const ETimeframeNotPassed: u64 = 108;
    const EPositionAlreadyExists: u64 = 109;

    const EUnauthorizedAccess: u64 = 200;

    const REAL_ESTATE: u8 = 0;
    const AIR_QUALITY: u8 = 1;
    const HOUR: u64 = 3600;

    /* Events */
    #[event]
    public struct PositionResolvedEvent has store, copy, drop {
        player: address,
        guess: u64,
        long: bool,
        timeframe: u64,
        timestamp: u256,
        won: bool,
        final_value: u64
    }

    #[event]
    public struct PositionCreatedEvent has store, copy, drop {
        player: address,
        guess: u64,
        long: bool,
        timeframe: u64,
        timestamp: u256
    }

    #[event]
    public struct NewPlayerEvent has store, copy, drop {
        player: address,
        timestamp: u256
    }
    /* ------ */

    public struct Position has store, copy, drop {
        oracle_key: vector<u8>, // Unique identifier for fetching data
        guess: u64,
        long: bool,
        timeframe: u64, // i.e. 1h, 2h, 4h, 6h, 8h, 24h
        timestamp: u256,
        resolvable: bool,
    }

    //TODO: make into an nft that the player owns instead
    public struct Player has store {
        wins: u64,
        losses: u64,
        positions: table::Table<vector<u8>, Position>, // position key
        //positions: vector<Position>, // position key
        actual_values: table::Table<vector<u8>, u64>,
        city_count: table::Table<vector<u8>, u64>,
        categories_count: table::Table<vector<u8>, u64>,
    }

    public struct City has store {
        name: vector<u8>,
        category_id: u8,
    }

    public struct Master has key {
        oracle_addr: address,
        timeframes: vector<u64>,
        players: table::Table<address, Player>,
        player_addrs: vector<address>,
        valid_cities: vector<City>,
        valid_categories: vector<u8>,
        current_time: u256,
    }

    fun string_equal(s1: &vector<u8>, s2: &vector<u8>): bool {
        if (vector::length(s1) != vector::length(s2)) {
            return false
        };

        for (i in 0..vector::length(s1)) {
            if (*vector::borrow(s1, i) != *vector::borrow(s2, i)) {
                return false
            };
        };
        true
    }

    fun new_player(player: &signer, master: &mut Master) {
        table::add(&mut master.players, signer::address_of(player), Player {
            wins: 0,
            losses:0,
            positions: table::new<vector<u8>, Position>(),
            actual_values: table::new<vector<u8>, u64>(),
            city_count: table::new<vector<u8>, u64>(),
            categories_count: table::new<vector<u8>, u64>(),
        });
        vector::push_back(&mut master.player_addrs, signer::address_of(player));

        event::emit(NewPlayerEvent { player: signer::address_of(player), timestamp: master.current_time })
    }

    fun is_valid_city(master: &Master, city_name: vector<u8>, category_id: u8): bool {
        let i = 0;
        while (i < vector::length(&master.valid_cities)) {
            let city = vector::borrow(&master.valid_cities, i);
            if (string_equal(&city.name, &city_name) && city.category_id == category_id) {
                return true
            };
            i = i + 1;
        };

        false
    }

    fun is_valid_category(master: &Master, category_id: u8): bool {
        let i = 0;
        while ( i < vector::length(&master.valid_categories) ) {
            if (*vector::borrow(&master.valid_categories, i) == category_id) {
                return true
            };
            i = i + 1;
        };
        false
    }

    fun is_valid_timeframe(master: &Master, timeframe: u64): bool {
        let i = 0;
        while (i < vector::length(&master.timeframes)) {
            if (timeframe == *vector::borrow(&master.timeframes, i)) {
                return true
            };
            i = i + 1;
        };
        false
    }

    public entry fun update_time(caller: &signer, new_time: u256) acquires Master {
        let master = borrow_global_mut<Master>(signer::address_of(caller));
        assert!(new_time > master.current_time, ETimeTravel);
        master.current_time = new_time;
    }

    fun add_win(player: &mut Player) {
        player.wins = player.wins + 1;
    }

    fun add_loss(player: &mut Player) {
        player.wins = player.losses + 1;
    }

    public fun resolve_positions(
        master_addr: address,
        player_signer: &signer,
        category_id: u8,
        city_name: vector<u8>,
        timeframe: u64): bool acquires Master
    {
        let master = borrow_global_mut<Master>(master_addr);
        assert!(is_valid_city(master, city_name, category_id), ENotValidCity);
        assert!(is_valid_timeframe(master, timeframe), ENotValidTimeframe);
        assert!(is_valid_category(master, category_id));

        let player_addr = signer::address_of(player_signer);
        //let player = master.players.borrow_mut(player_addr);
        let player = table::borrow_mut(&mut master.players, player_addr);

        let position_key = create_position_key(&city_name, category_id, timeframe);
        let position: Position = *player.positions.borrow(position_key);
        assert!(player.positions.contains(position_key), EPositionNotExist);
        assert!(position.resolvable, EPositionNotResolvable);
        assert!(player.actual_values.contains(position_key), EActualValueMissing);
        assert!(master.current_time >= ((HOUR * position.timeframe) as u256) + position.timestamp, ETimeframeNotPassed);

        let current_value = *table::borrow(&player.actual_values, position_key);
        let won = false;

        if (position.long) {
            if (current_value > position.guess) {
                add_win(player);
                won = true;
            } else {
                add_loss(player);
            };
        } else {
            if (current_value < position.guess) {
                add_win(player);
                won = true;
            } else {
                add_loss(player);
            };
        };

        event::emit(PositionResolvedEvent {
            player: signer::address_of(player_signer),
            guess: position.guess,
            long: position.long,
            timeframe: position.timeframe,
            timestamp: position.timestamp,
            won,
            final_value: current_value,
        });

        player.positions.remove(position_key);

        won
    }

    public entry fun create_position(
        player_signer: &signer,
        master_addr: address,
        category_id: u8,
        city_name: vector<u8>,
        timeframe: u64,
        long: bool
    ) acquires Master {
        let player_addr = signer::address_of(player_signer);
        let position_key;
        let needs_resolution = false;

        {
            let master = borrow_global<Master>(master_addr);
            position_key = create_position_key(&city_name, category_id, timeframe);

            if (table::contains(&master.players, player_addr)) {
                let player = table::borrow(&master.players, player_addr);
                needs_resolution = table::contains(&player.positions, position_key);
            };
        };

        if (needs_resolution) {
            resolve_positions(
                master_addr,
                player_signer,
                category_id,
                copy city_name, // Explicit copy to avoid move
                timeframe
            );
        };

        let master = borrow_global_mut<Master>(master_addr);

        assert!(is_valid_city(master, copy city_name, category_id), ENotValidCity);
        assert!(is_valid_timeframe(master, timeframe), ENotValidTimeframe);
        assert!(is_valid_category(master, category_id));

        if (!table::contains(&master.players, player_addr)) {
            new_player(player_signer, master);
        };

        let player = table::borrow_mut(&mut master.players, player_addr);

        assert!(
            !table::contains(&player.positions, position_key),
            EPositionAlreadyExists
        );

        let current_guess = oracle::get_value(
            master.oracle_addr,
            category_id,
            copy city_name
        );
        assert!(current_guess != 0, EOracleNotUpdated);

        let new_position = Position {
            oracle_key: create_oracle_key(category_id, copy city_name),
            guess: current_guess,
            long,
            timeframe,
            timestamp: master.current_time,
            resolvable: false,
        };

        table::add(&mut player.positions, position_key, new_position);

        // Update counters with proper initialization
        if (!table::contains(&player.categories_count, position_key)) {
            table::add(&mut player.categories_count, position_key, 0);
        };
        let cat_count = table::borrow_mut(&mut player.categories_count, position_key);
        *cat_count = *cat_count + 1;

        if (!table::contains(&player.city_count, position_key)) {
            table::add(&mut player.city_count, position_key, 0);
        };
        let city_count = table::borrow_mut(&mut player.city_count, position_key);
        *city_count = *city_count + 1;

        // Emit event
        event::emit(PositionCreatedEvent {
            player: player_addr,
            guess: new_position.guess,
            long: new_position.long,
            timeframe: new_position.timeframe,
            timestamp: new_position.timestamp,
        });
    }

    public fun fill_actual_values(
        master: &mut Master,
        player_addr: address,
        city_name: vector<u8>,
        category_id: u8,
        timeframe: u64,
        actual_value: u64)
    {
        //let master = borrow_global_mut<Master>(signer::address_of(caller));
        assert!(is_valid_city(master, city_name, category_id), ENotValidCity);
        assert!(is_valid_timeframe(master, timeframe), ENotValidTimeframe);
        assert!(is_valid_category(master, category_id));
        let position_key = create_position_key(&city_name, category_id, timeframe);
        let player = master.players.borrow_mut(player_addr);
        let position = player.positions.borrow(position_key);
        if (!position.resolvable) {
            if (master.current_time >= position.timestamp + ((HOUR * timeframe) as u256)) {
                let actual = player.actual_values.borrow_mut(position_key);
                *actual = actual_value;
            };
        };
    }

    public entry fun fill_actual_values_all(
            caller: &signer,
            city_name: vector<u8>,
            category_id: u8,
            timeframe: u64,
            actual_value: u64) acquires Master
    {
        let master = borrow_global_mut<Master>(signer::address_of(caller));
        assert!(is_valid_city(master, city_name, category_id), ENotValidCity);
        assert!(is_valid_timeframe(master, timeframe), ENotValidTimeframe);
        assert!(is_valid_category(master, category_id));
        for (i in 0..vector::length(&master.player_addrs)) {
            let player_addr = vector::borrow(&master.player_addrs, i);
            fill_actual_values(master, *player_addr, city_name, category_id, timeframe, actual_value);
        };
    }

    #[view]
    public fun get_active_players(master_addr: address): vector<address> acquires Master{
        let master = borrow_global<Master>(master_addr);
        master.player_addrs
    }

    #[view]
    public fun get_player_win_loss(master_addr: address,
        player: address): (u64, u64)
    acquires Master
    {
        let master = borrow_global<Master>(master_addr);
        let player_obj = master.players.borrow(player);
        (player_obj.wins, player_obj.losses)
    }

    #[view]
    public fun get_city_count(master_addr: address,
        player: address,
        city_name: vector<u8>): u64
    acquires Master
    {
        let master = borrow_global<Master>(master_addr);
        *master.players.borrow(player).city_count.borrow(city_name)
    }

    #[view]
    public fun get_categories_count(master_addr: address,
        player: address,
        city_name: vector<u8>): u64
    acquires Master {
        let master = borrow_global<Master>(master_addr);
        *master.players.borrow(player).categories_count.borrow(city_name)
    }

    fun create_oracle_key(category_id: u8, city_name: vector<u8>): vector<u8> {
        let data = vector::empty<u8>();
        vector::push_back(&mut data, category_id);
        vector::append(&mut data, city_name);
        aptos_hash::keccak256(data)
    }

    fun create_position_key(city_name: &vector<u8>, category_id: u8, timeframe: u64): vector<u8> {
        let data = vector::empty<u8>();
        vector::push_back(&mut data, category_id);
        vector::append(&mut data, *city_name);
        vector::push_back(&mut data, timeframe as u8);
        aptos_hash::keccak256(data)
    }

    #[view]
    public fun get_player_positions(master_addr: address,
        player: address,
        city_name: vector<u8>,
        category_id: u8): vector<Position>
    acquires Master
    {
        let master = borrow_global<Master>(master_addr);
        let ret = vector::empty<Position>();
        if (!table::contains(&master.players, player)) {
            return ret
        };
        let player_obj = table::borrow(&master.players, player);

        let i = 0;
        while ( i < vector::length(&master.timeframes) ) {
            let timeframe = vector::borrow(&master.timeframes, i);
            let position_key = create_position_key(&city_name, category_id, *timeframe);
            if (table::contains(&player_obj.actual_values, position_key)) {
                let position = *player_obj.positions.borrow(position_key);
                ret.push_back(position);
            };
            i = i + 1;
        };

        ret
    }

    #[view]
    public fun get_actual_values(master_addr: address,
        player: address,
        city_name: vector<u8>,
        category_id: u8): vector<u64>
    acquires Master
    {
        let master = borrow_global<Master>(master_addr);
        let player_obj = table::borrow(&master.players, player);
        let ret = vector::empty<u64>();

        let i = 0;
        while ( i < master.timeframes.length() ) {
            let timeframe = vector::borrow(&master.timeframes, i);
            let position_key = create_position_key(&city_name, category_id, *timeframe);
            if (table::contains(&player_obj.actual_values, position_key)) {
                let actual_value = *table::borrow(&player_obj.actual_values, position_key);
                vector::push_back(&mut ret, actual_value);
            };
            i = i + 1;
        };

        ret
    }

    public entry fun add_city(caller: &signer,
        city_name: vector<u8>,
        category_id: u8) acquires Master
    {
        let master = borrow_global_mut<Master>(signer::address_of(caller));
        for (i in 0..master.valid_cities.length()) {
            let city_i = master.valid_cities.borrow(i);
            let city_i_vec = vector::empty<u8>();
            city_i_vec.push_back(category_id as u8);
            city_i_vec.append(city_i.name);

            let target_city = vector::empty<u8>();
            target_city.push_back(category_id as u8);
            target_city.append(city_name);

            assert!(string_equal(&aptos_hash::keccak256(target_city), &aptos_hash::keccak256(city_i_vec)), ECityAlreadyExists);
            i = i + 1
        };

        vector::push_back(&mut master.valid_cities, City {
            name: city_name,
            category_id
        });
    }

    fun init_module(account: &signer) {
        let newMaster = Master {
            oracle_addr: @admin,
            timeframes: std::vector::empty(),
            players: table::new(),
            player_addrs: vector::empty<address>(),
            current_time: 0,
            valid_cities: std::vector::empty(),
            valid_categories: std::vector::empty(),
        };
        init_everything(&mut newMaster);
        move_to(account, newMaster);
    }

    fun init_everything(master: &mut Master) {
        let valid_cities = std::vector::empty<vector<u8>>();
        vector::push_back(&mut valid_cities, b"hongkong");
        vector::push_back(&mut valid_cities, b"singapore");
        vector::push_back(&mut valid_cities, b"dubai");
        vector::push_back(&mut valid_cities, b"london");
        vector::push_back(&mut valid_cities, b"sydney");
        vector::push_back(&mut valid_cities, b"melbourne");
        vector::push_back(&mut valid_cities, b"adelaide");
        vector::push_back(&mut valid_cities, b"brisbane");

        //initialize valid real estate cities
        for (i in 0..vector::length(&valid_cities)) {
            let name = *vector::borrow(&valid_cities, i);
            vector::push_back(&mut master.valid_cities, City {
                name,
                category_id: REAL_ESTATE,
            });
        };

        //initialize air quality cities
        vector::push_back(&mut master.valid_cities, City {
            name: b"hongkong",
            category_id: AIR_QUALITY,
        });

        vector::push_back(&mut master.valid_cities, City {
            name: b"delhi",
            category_id: AIR_QUALITY,
        });

        // initialize timeframes
        vector::push_back(&mut master.timeframes, 1);
        vector::push_back(&mut master.timeframes, 2);
        vector::push_back(&mut master.timeframes, 4);
        vector::push_back(&mut master.timeframes, 6);
        vector::push_back(&mut master.timeframes, 8);
        vector::push_back(&mut master.timeframes, 24);

        // categories (realestate and airquality)
        vector::push_back(&mut master.valid_categories, REAL_ESTATE);
        vector::push_back(&mut master.valid_categories, AIR_QUALITY);
    }

}
