import { Text } from "react-native";

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontFamily: "InriaSans-Regular",

      }}
    >{children}</Text>
  );
}


