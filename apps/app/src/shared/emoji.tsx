// @ts-ignore
import { Picker } from "emoji-mart-native";
import { Keyboard } from "react-native-ui-lib";

export const EmojiPalette = "emoji.palette";

const Palette = () => {
	return (
		<Picker
			emojiSize={32}
			emojiMargin={12}
			onPress={(e: any) =>
				Keyboard.KeyboardRegistry.onItemSelected(EmojiPalette, e.native)
			}
			native={true}
			theme="auto"
			rows={5}
			perLine={9}
			pagesToEagerLoad={137}
		/>
	);
};

Keyboard.KeyboardRegistry.registerKeyboard(EmojiPalette, () => Palette);
