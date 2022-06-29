import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import {
	NativeStackHeaderProps,
	NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { Image } from "react-native";
import { Appbar, Menu } from "react-native-paper";
import { Modalize } from "react-native-modalize";
import { Messages } from "./messages";
import { Contacts } from "./contacts";
import { Feed } from "./feed";
import { Profile } from "../shared/profile";
import { VoidContext } from "../context";

const Tabs = createMaterialBottomTabNavigator();

const Header: React.FC<
	NativeStackHeaderProps & {
		title: string;
		profile: React.RefObject<Modalize>;
	}
> = ({ title, profile }) => {
	const emitter = useContext(VoidContext);
	const [visible, setVisible] = useState(false);

	const openProfile = () => {
		profile.current?.open();
		setVisible(false);
	};

	return (
		<Appbar.Header>
			<Appbar.Content title={title} />
			<Menu
				visible={visible}
				onDismiss={() => setVisible(false)}
				anchor={
					<Appbar.Action
						icon={({ size }) => (
							<Image
								source={{
									uri: emitter.getAvatar(emitter.self.id),
									width: size,
									height: size,
								}}
								borderRadius={size / 2}
							/>
						)}
						onPress={() => setVisible(true)}
					/>
				}
			>
				<Menu.Item title="Profile" onPress={openProfile} />
			</Menu>
		</Appbar.Header>
	);
};

export const Home: React.FC<{
	navigation: NavigationProp<any>;
	route: RouteProp<any>;
}> = ({ navigation, route }) => {
	const emitter = useContext(VoidContext);
	const [title, setTitle] = useState("");
	const profile = useRef<Modalize>(null);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			header: (props) => (
				<Header {...props} title={title} profile={profile} />
			),
		} as NativeStackNavigationOptions);
	}, [title, navigation, route]);

	return (
		<>
			<Tabs.Navigator
				screenListeners={{
					focus: (e) =>
						setTitle(
							e.target?.slice(
								0,
								e.target.lastIndexOf("-")
							) as string
						),
				}}
			>
				<Tabs.Screen name="Messages" component={Messages} />
				<Tabs.Screen name="Contacts" component={Contacts} />
				<Tabs.Screen name="Feed" component={Feed} />
			</Tabs.Navigator>
			<Profile ref={profile} user={emitter.self.id} />
		</>
	);
};
