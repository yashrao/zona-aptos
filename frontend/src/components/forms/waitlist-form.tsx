import { FC, Fragment, useState } from "react";
import Image from "next/image";

const WaitlistForm: FC = () => {
  const [isSent, setIsSent] = useState(false);

  const [email, setEmail] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [preferredCities, setPreferredCities] = useState("");
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [baseWalletAddress, setBaseWalletAddress] = useState("");
  const [remarks, setRemarks] = useState("");
  const [notAmerican, setNotAmerican] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const timestamp = new Date();
    const email2 = email;

    const formData = {
      timestamp,
      email,
      preferredName,
      preferredCities,
      countryOfResidence,
      twitterHandle,
      email2,
      discordId,
      baseWalletAddress,
      remarks,
      notAmerican,
    };

    try {
      const response = await fetch("/api/v1/submit", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setIsSent(true);
      setEmail("");
      setPreferredName("");
      setPreferredCities("");
      setTwitterHandle("");
      setDiscordId("");
      setBaseWalletAddress("");
      setRemarks("");
      setNotAmerican(false);
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-x-[100px]">
        <div className="sm:col-span-1 col-span-2">
          <div className="flex flex-col items-center justify-center">
            <span className="text-center font-bold text-[36px]">
              Join the Zona Waitlist
            </span>
            <p className="text-[#D9D9D9] font-thin text-center mt-4">
              Become an early community member and let us know which cities you
              want to trade
            </p>
            <Image
              className="w-full my-12"
              src="/images/home/asia-pacific.png"
              alt="Your Company"
              height={400}
              width={400}
            />
          </div>
        </div>
        {!isSent ? (
          <div className="sm:col-span-1 col-span-2 my-auto">
            <form onSubmit={handleSubmit}>
              <input
                className="w-full py-4 rounded-xl border-[#d9d9d9] border-2 bg-transparent focus:border-zona-green focus:ring-zona-green mb-8"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full py-4 rounded-xl border-[#d9d9d9] border-2 bg-transparent focus:border-zona-green focus:ring-zona-green mb-8"
                placeholder="Preferred Name"
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
              />
              <input
                className="w-full py-4 rounded-xl border-[#d9d9d9] border-2 bg-transparent focus:border-zona-green focus:ring-zona-green mb-8"
                placeholder="Which cities do you want to trade on Zona?"
                type="text"
                value={preferredCities}
                onChange={(e) => setPreferredCities(e.target.value)}
              />
              <input
                className="w-full py-4 rounded-xl border-[#d9d9d9] border-2 bg-transparent focus:border-zona-green focus:ring-zona-green mb-8"
                placeholder="Country of Residence"
                type="text"
                value={countryOfResidence}
                onChange={(e) => setCountryOfResidence(e.target.value)}
              />
              <input
                className="w-full py-4 rounded-xl border-[#d9d9d9] border-2 bg-transparent focus:border-zona-green focus:ring-zona-green mb-8"
                placeholder="Twitter Handle"
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
              />
              <input
                className="w-full py-4 rounded-xl border-[#d9d9d9] border-2 bg-transparent focus:border-zona-green focus:ring-zona-green mb-8"
                placeholder="Discord ID"
                type="text"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
              />
              <input
                className="w-full py-4 rounded-xl border-[#d9d9d9] border-2 bg-transparent focus:border-zona-green focus:ring-zona-green mb-8"
                placeholder="Base Wallet Address"
                type="text"
                value={baseWalletAddress}
                onChange={(e) => setBaseWalletAddress(e.target.value)}
              />

              <input
                className="w-full py-4 rounded-xl border-[#d9d9d9] border-2 bg-transparent focus:border-zona-green focus:ring-zona-green mb-8"
                placeholder="Anything else you want to share?"
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <div className="flex items-center gap-x-5">
                <input
                  type="checkbox"
                  name="answer"
                  id="notAmerican"
                  checked={notAmerican}
                  onChange={(e) => setNotAmerican(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="notAmerican">
                  I confirm I am not a United States citizen, or currently
                  reside in the United States of America.
                </label>
              </div>

              <div className="flex items-center justify-center mt-10">
                <button
                  className="py-4 sm:w-[65%] w-full font-bold rounded-xl text-black bg-branding-deep-green border-zona-green border-2 bg-zona-green hover:text-zona-green hover:bg-transparent"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="sm:col-span-1 col-span-2 my-auto text-[36px] font-bold text-center">
              <span>Thank you for your message.</span>
              <p className="mt-6">We will contact you shortly.</p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default WaitlistForm;
