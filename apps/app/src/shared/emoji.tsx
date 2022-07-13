import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import data from "unicode-emoji-json/data-by-group.json";
import React, { useState } from "react";
import {
	useColorScheme,
	useWindowDimensions,
	ScrollView,
	View,
} from "react-native";
import {
	BottomNavigation,
	Menu,
	Text,
	TouchableRipple,
} from "react-native-paper";
import skinTone, { SkinToneType } from "skin-tone";
import { PRIMARY_BLUE, SECONDARY_DARK, SECONDARY_LIGHT } from "../colors";

type Emoji = typeof data["Activities"][0];

const tones: Record<SkinToneType, string> = {
	none: "👌",
	white: "👌🏻",
	creamWhite: "👌🏼",
	lightBrown: "👌🏽",
	brown: "👌🏾",
	darkBrown: "👌🏿",
};

const Category: React.FC<{
	category: keyof typeof data;
	onPress: (emoji: string) => void;
}> = ({ category, onPress }) => {
	const { width, height } = useWindowDimensions();

	return (
		<View
			style={{
				width: width * 0.8,
				height: height * 0.6 - 96,
			}}
		>
			<ScrollView
				contentContainerStyle={{
					flexDirection: "row",
					flexWrap: "wrap",
					alignItems: "flex-start",
					justifyContent: "space-around",
				}}
			>
				{data[category].map((emoji) => (
					<TouchableRipple
						key={emoji.slug}
						onPress={() => onPress(emoji.emoji)}
						style={{ padding: 6 }}
					>
						<Text style={{ fontSize: 32, width: 48, height: 48 }}>
							{emoji.emoji}
						</Text>
					</TouchableRipple>
				))}
			</ScrollView>
		</View>
	);
};

export const Palette: React.FC<{
	visible: boolean;
	onDismiss: () => void;
	anchor: React.ReactNode;
	onPress: (emoji: string) => void;
}> = ({ visible, onDismiss, anchor, onPress }) => {
	const dark = useColorScheme() === "dark";
	const { width, height } = useWindowDimensions();

	const [index, setIndex] = useState(0);
	const [routes] = useState([
		{
			key: "smileys",
			focusedIcon: "emoticon",
		},
		{
			key: "people",
			focusedIcon: "account",
		},
		{
			key: "animals",
			focusedIcon: "cat",
		},
		{
			key: "food",
			focusedIcon: "hamburger",
		},
		{
			key: "activities",
			focusedIcon: "tennis",
		},
		{
			key: "travel",
			focusedIcon: "car",
		},
		{
			key: "objects",
			focusedIcon: "lightbulb",
		},
		{
			key: "symbols",
			focusedIcon: "heart",
		},
		{
			key: "flags",
			focusedIcon: "flag",
		},
	]);

	const renderScene = BottomNavigation.SceneMap({
		smileys: () => (
			<Category category="Smileys & Emotion" onPress={onPress} />
		),
		people: () => <Category category="People & Body" onPress={onPress} />,
		animals: () => (
			<Category category="Animals & Nature" onPress={onPress} />
		),
		food: () => <Category category="Food & Drink" onPress={onPress} />,
		activities: () => <Category category="Activities" onPress={onPress} />,
		travel: () => <Category category="Travel & Places" onPress={onPress} />,
		objects: () => <Category category="Objects" onPress={onPress} />,
		symbols: () => <Category category="Symbols" onPress={onPress} />,
		flags: () => <Category category="Flags" onPress={onPress} />,
	});
	const renderIcon = (props: {
		route: { focusedIcon: string };
		focused: boolean;
		color: string;
	}) => {
		return (
			<Icon
				name={props.route.focusedIcon}
				color={props.focused ? PRIMARY_BLUE : props.color}
				size={24}
			/>
		);
	};

	return (
		<Menu visible={visible} onDismiss={onDismiss} anchor={anchor}>
			<View
				style={{
					width: width * 0.8,
					height: height * 0.6,
					paddingBottom: 48,
				}}
			>
				<BottomNavigation
					labeled={false}
					navigationState={{ index, routes }}
					onIndexChange={setIndex}
					renderScene={renderScene}
					renderIcon={renderIcon}
				></BottomNavigation>
			</View>
		</Menu>
	);
};
