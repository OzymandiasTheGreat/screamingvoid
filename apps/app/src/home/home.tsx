import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MessagesTab } from "./messages";
import { FeedTab } from "./feed";
import { TestingTab } from "./testing";

const Tabs = createMaterialBottomTabNavigator();

export const HomeScreen: React.FC = () => {
	return (
		<Tabs.Navigator>
			<Tabs.Screen name="TestTab" component={TestingTab} />
			<Tabs.Screen name="Messages" component={MessagesTab} />
			<Tabs.Screen name="Feed" component={FeedTab} />
		</Tabs.Navigator>
	);
};
