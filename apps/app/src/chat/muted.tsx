import { NavigationProp, RouteProp } from "@react-navigation/native";
import {
	NativeStackHeaderProps,
	NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	useColorScheme,
	FlatList,
	Image,
	SafeAreaView,
	View,
} from "react-native";
import { Modalize } from "react-native-modalize";
import { Appbar, FAB, Headline, List, Menu } from "react-native-paper";
import { PRIMARY_DARK, PRIMARY_LIGHT } from "../colors";
import { VoidContext } from "../context";

type MutedConvo = {
	id: string;
	name: string;
	peers: { id: string; name?: string; bio?: string }[];
};

const Header: React.FC<NativeStackHeaderProps> = ({ back, navigation }) => {
	const emitter = useContext(VoidContext);
	const [visible, setVisible] = useState(false);

	return (
		<Appbar.Header>
			{!!back && (
				<Appbar.BackAction onPress={() => navigation.goBack()} />
			)}
			<Appbar.Content title="Muted Chats" />
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
								style={{ borderRadius: size / 2 }}
							/>
						)}
						onPress={() => setVisible(true)}
					/>
				}
			></Menu>
		</Appbar.Header>
	);
};

export const MutedConversations: React.FC<{
	navigation: NavigationProp<any>;
	route: RouteProp<any>;
}> = ({ navigation, route }) => {
	const emitter = useContext(VoidContext);
	const dark = useColorScheme() === "dark";
	const [convos, setConvos] = useState<MutedConvo[]>([]);
	const [current, setCurrent] = useState<MutedConvo>();
	const modal = useRef<Modalize>(null);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			header: (props) => <Header {...props} />,
		} as NativeStackNavigationOptions);
	}, [navigation, route]);
	useEffect(() => {
		const listener = emitter.on(["conversation", "muted"], (data) =>
			setConvos(data)
		);
		emitter.emit(["request", "conversation", "muted"]);
		return () => {
			listener.off();
		};
	}, [emitter]);

	const renderConvo = ({ item }: { item: MutedConvo }) => {
		const peers = item.peers.filter((p) => p.id !== emitter.self.id);
		const imgSize = peers.length === 1 ? 48 : 24;
		const sources = peers.slice(0, 4).map((p) => ({
			uri: emitter.getAvatar(p.id),
			width: imgSize,
			height: imgSize,
		}));
		const onPress = () => {
			setCurrent({ ...item, peers });
			modal.current?.open();
		};

		return (
			<List.Item
				key={item.id}
				title={
					peers.length > 1 ? item.name : peers[0].name || peers[0].id
				}
				onPress={onPress}
				left={(props) => (
					<View
						{...props}
						style={{
							flexDirection: "row",
							flexWrap: "wrap",
							alignItems: "center",
							justifyContent: "center",
							width: 48,
							height: 48,
						}}
					>
						{sources.map((source) => (
							<Image
								key={source.uri}
								source={source}
								style={{ borderRadius: imgSize / 2 }}
							/>
						))}
					</View>
				)}
			/>
		);
	};
	const renderPeer = ({ item }: { item: MutedConvo["peers"][0] }) => {
		return (
			<List.Item
				key={item.id}
				title={item.name || item.id}
				description={item.bio}
				left={(props) => (
					<List.Icon
						{...props}
						icon={({ size }) => (
							<Image
								source={{
									uri: emitter.getAvatar(item.id),
									width: size,
									height: size,
								}}
								style={{ borderRadius: size / 2 }}
							/>
						)}
					/>
				)}
			/>
		);
	};

	const unmute = () => {
		emitter.emit(["request", "conversation", "mute"], {
			id: current?.id as string,
			muted: false,
		});
		setConvos((prev) => prev.filter((c) => c.id !== current?.id));
		modal.current?.close();
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FlatList data={convos} renderItem={renderConvo} />
			<Modalize
				ref={modal}
				withHandle={false}
				flatListProps={{
					data: current?.peers,
					renderItem: renderPeer,
				}}
				modalStyle={{
					backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
				}}
				HeaderComponent={
					<Headline style={{ padding: 16 }}>Participants</Headline>
				}
				FloatingComponent={
					<FAB
						icon="volume-high"
						label="Unmute"
						style={{
							position: "absolute",
							bottom: 16,
							right: 16,
						}}
						onPress={unmute}
					/>
				}
			/>
		</SafeAreaView>
	);
};
