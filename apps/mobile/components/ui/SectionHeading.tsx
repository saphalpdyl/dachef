import { Text } from "react-native";

export default function SectionHeading({ children }: { children: React.ReactNode }) {

  return (
    <Text
      style={{
        fontSize: 21,
        fontFamily: "InriaSans-Bold",
        fontWeight: "bold",

      }}
    >{children}</Text>
  );
}


