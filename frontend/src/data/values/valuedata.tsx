import LockIcon from "@mui/icons-material/Lock";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";

export default function useValueData() {
  return [
    {
      name: "Total Value Locked",
      value: "$000,000,000,000.00",
      icon: (
        <LockIcon
          style={{
            width: "20px",
            height: "20px",
            color: "grey",
            marginBottom: "5px",
          }}
        />
      ),
    },
    {
      name: "Total Open Interest",
      value: "$000,000,000,000.00",
      icon: (
        <SyncAltIcon
          style={{
            width: "20px",
            height: "20px",
            color: "grey",
            marginBottom: "2px",
          }}
        />
      ),
    },
    {
      name: "Total Volume",
      value: "$000,000,000,000.00",
      icon: (
        <SignalCellularAltIcon
          style={{
            width: "20px",
            height: "20px",
            color: "grey",
            marginBottom: "5px",
          }}
        />
      ),
    },
  ];
}
