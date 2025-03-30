import { useNavigation, useLocalSearchParams } from "expo-router";
import CameraScreen from "./create_recipe";

export default function SnapViewScreen({ }: { }) {
  const navigation = useNavigation();

  const local = useLocalSearchParams();
  return (
    <CameraScreen 
      override_rawRecipeText={local.override_rawRecipeText}
      override_parsedRecipes={local.override_parsedRecipes}
      override_imageUri={local.override_imageUri}
      override_items={local.override_items}
      override_selectedItems={local.override_selectedItems}
      override_searchQueries={local.override_searchQueries}
      override_whereItSearched={local.override_whereItSearched}
      disableImageUploadOnLoad={true}
      startCompleted={true}
    />
  );
}
