import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import {
	NativeStackHeaderProps,
	NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { useColorScheme, Image, SafeAreaView, Share, View } from "react-native";
import { Appbar, FAB, Headline, Menu, Text } from "react-native-paper";
import { Modalize } from "react-native-modalize";
import QRCode from "react-native-qrcode-svg";
import { Messages } from "./messages";
import { Contacts } from "./contacts";
import { Feed } from "./feed";
import { Profile } from "../shared/profile";
import { VoidContext } from "../context";
import { encodePeer } from "../util";
import { PRIMARY_DARK, PRIMARY_LIGHT } from "../colors";

const Tabs = createMaterialBottomTabNavigator();

const Header: React.FC<
	NativeStackHeaderProps & {
		title: string;
		profile: React.RefObject<Modalize>;
		share: React.RefObject<Modalize>;
		archived: boolean;
		setArchived: (show: boolean) => void;
	}
> = ({ title, profile, share, navigation, archived, setArchived }) => {
	const emitter = useContext(VoidContext);
	const [visible, setVisible] = useState(false);

	const openProfile = () => {
		profile.current?.open();
		setVisible(false);
	};
	const openRequests = () => {
		navigation.navigate("ChatRequests");
		setVisible(false);
	};
	const openMuted = () => {
		navigation.navigate("MutedChats");
		setVisible(false);
	};
	const openShare = () => {
		share.current?.open();
		setVisible(false);
	};

	return (
		<Appbar.Header>
			{archived && (
				<Appbar.BackAction onPress={() => setArchived(false)} />
			)}
			<Appbar.Content title={title} />
			<Menu
				visible={visible}
				onDismiss={() => setVisible(false)}
				anchor={
					<Appbar.Action
						icon={({ size }) => {
							return (
								<Image
									source={{
										uri: emitter.getAvatar(emitter.self.id),
										width: size,
										height: size,
									}}
									style={{ borderRadius: size / 2 }}
								/>
							);
						}}
						onPress={() => setVisible(true)}
					/>
				}
			>
				<Menu.Item
					title="Profile"
					icon="account-circle"
					onPress={openProfile}
				/>
				<Menu.Item title="Share" icon="share" onPress={openShare} />
				<Menu.Item
					title="Chat Requests"
					icon="message-question"
					onPress={openRequests}
				/>
				<Menu.Item
					title="Archived Chats"
					icon="archive"
					onPress={() => {
						setArchived(true);
						setVisible(false);
					}}
				/>
				<Menu.Item
					title="Muted Chats"
					icon="volume-off"
					onPress={openMuted}
				/>
				<Menu.Item
					title="Logout"
					icon="logout-variant"
					onPress={() => emitter.emit(["request", "close"])}
				/>
			</Menu>
		</Appbar.Header>
	);
};

export const Home: React.FC<{
	navigation: NavigationProp<any>;
	route: RouteProp<any>;
}> = ({ navigation, route }) => {
	const emitter = useContext(VoidContext);
	const dark = useColorScheme() === "dark";
	const [title, setTitle] = useState("");
	const [archived, setArchived] = useState(false);
	const profile = useRef<Modalize>(null);
	const share = useRef<Modalize>(null);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			header: (props) => (
				<Header
					{...props}
					title={title}
					profile={profile}
					share={share}
					archived={archived}
					setArchived={setArchived}
				/>
			),
		} as NativeStackNavigationOptions);
	}, [title, navigation, route]);
	useEffect(
		() => setTitle(archived ? "Archived Chats" : "Messages"),
		[archived]
	);

	return (
		<>
			{archived ? (
				<SafeAreaView style={{ flex: 1 }}>
					<Messages
						navigation={navigation}
						route={{ ...route, params: { archived: true } }}
					/>
				</SafeAreaView>
			) : (
				<Tabs.Navigator
					screenListeners={{
						focus: (e) =>
							setTitle(
								e.target?.slice(
									0,
									e.target.indexOf("-")
								) as string
							),
					}}
				>
					<Tabs.Screen
						name="Messages"
						component={Messages}
						options={{ tabBarIcon: "forum" }}
						initialParams={{ archived: false }}
					/>
					<Tabs.Screen
						name="Contacts"
						component={Contacts}
						options={{ tabBarIcon: "account" }}
					/>
					<Tabs.Screen
						name="Feed"
						component={Feed}
						options={{ tabBarIcon: "wall" }}
					/>
				</Tabs.Navigator>
			)}
			<Profile ref={profile} user={emitter.self.id} />
			<Modalize
				ref={share}
				adjustToContentHeight
				modalStyle={{
					backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
				}}
				withHandle={false}
			>
				<View
					style={{
						flex: 1,
						minHeight: 512,
						alignItems: "center",
						justifyContent: "space-around",
					}}
				>
					<Headline>{emitter.self.name}</Headline>
					<QRCode size={256} value={encodePeer(emitter.self.id)} />
					<Text selectable={true}>{encodePeer(emitter.self.id)}</Text>
					<FAB
						style={{
							position: "absolute",
							bottom: 16,
							right: 16,
						}}
						icon="share"
						onPress={() =>
							Share.share({
								message: encodePeer(emitter.self.id),
								url: encodePeer(emitter.self.id),
							})
						}
					/>
				</View>
			</Modalize>
		</>
	);
};
