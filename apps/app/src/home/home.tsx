import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { Messages } from "./messages";
import { Contacts } from "./contacts";
import { Feed } from "./feed";

const Tabs = createMaterialBottomTabNavigator();

export const Home: React.FC = () => {
	return (
		<Tabs.Navigator>
			<Tabs.Screen name="Messages" component={Messages} />
			<Tabs.Screen name="Contacts" component={Contacts} />
			<Tabs.Screen name="Feed" component={Feed} />
		</Tabs.Navigator>
	);
};
