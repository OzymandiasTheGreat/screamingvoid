import React, { useContext, useEffect, useState } from "react";
import {
	useColorScheme,
	FlatList,
	Image,
	SafeAreaView,
	TouchableNativeFeedback,
	View,
} from "react-native";
import {
	ActivityIndicator,
	Button,
	Dialog,
	FAB,
	List,
	Portal,
	TextInput,
} from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import notifee from "@notifee/react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import sodium from "sodium-universal";
import type { LevelUp } from "levelup";
import sublevel from "subleveldown";
import type { SavedIdentity } from "./interface";
import { PrefsContext, VoidContext } from "./context";
import { PRIMARY_DARK, PRIMARY_LIGHT } from "./colors";

export const Login: React.FC = () => {
	const prefs = useContext(PrefsContext);
	const emitter = useContext(VoidContext);
	const dark = useColorScheme() === "dark";
	const [iddb, setIdDB] = useState<LevelUp>();
	const [identities, setIdentities] = useState<SavedIdentity[]>([]);
	const [prompt, setPrompt] = useState(false);
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [avatar, setAvatar] = useState("");
	const [base64, setBase64] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (prefs) {
			const db = sublevel(prefs, "VOID_IDENTITY", {
				keyEncoding: "utf8",
				valueEncoding: "json",
			});
			const onPut = (key: string, value: SavedIdentity) =>
				setIdentities((ids) => [...ids, value]);
			db.on("put", onPut);
			setIdDB(db);

			(async () => {
				const ids = [];
				for await (let [_, value] of db.iterator() as any) {
					ids.push(value);
				}
				setIdentities(ids);
			})();

			return () => {
				db.off("put", onPut);
			};
		}
	}, [prefs]);

	const pickPhoto = () => {
		ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [1, 1],
			base64: true,
			quality: 0.4,
		}).then((image) => {
			if (!image.cancelled) {
				setAvatar(image.uri);
				setBase64(image.base64 as string);
			}
		});
	};
	const createIdentity = () => {
		const pk = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
		const sk = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
		sodium.crypto_sign_keypair(pk, sk);
		const id: SavedIdentity = {
			displayName: name,
			publicKey: pk.toString("hex"),
			secretKey: sk.toString("hex"),
		};
		iddb?.put(id.publicKey, {
			displayName: id.displayName,
			publicKey: id.publicKey,
		})
			.then(() =>
				SecureStore.setItemAsync(id.publicKey, JSON.stringify(id), {
					requireAuthentication: true,
				})
			)
			.then(() => {
				setPrompt(false);
				setLoading(true);
				notifee
					.displayNotification({
						id: "service",
						body: "Void is running",
						title: "Void",
						android: {
							asForegroundService: true,
							channelId: "service",
						},
					})
					.then(
						() => new Promise((resolve) => setTimeout(resolve, 750))
					)
					.then(() => {
						emitter.emit(["request", "create"], {
							...id,
							name,
							bio,
							avatar: base64,
						});
						setName("");
						setBio("");
						setAvatar("");
						setBase64("");
					});
			});
	};
	const cancelIdentity = () => {
		setName("");
		setBio("");
		setAvatar("");
		setBase64("");
		setPrompt(false);
	};
	const onIdentityPress = (pk: string) => {
		SecureStore.getItemAsync(pk).then((json) => {
			if (json) {
				setLoading(true);
				notifee
					.displayNotification({
						id: "service",
						body: "Void is running",
						title: "Void",
						android: {
							asForegroundService: true,
							channelId: "service",
						},
					})
					.then(
						() => new Promise((resolve) => setTimeout(resolve, 750))
					)
					.then(() => {
						const id = JSON.parse(json);
						emitter.emit(["request", "open"], id);
					});
			}
		});
	};

	const renderIdentity = ({ item }: { item: SavedIdentity }) => (
		<List.Item
			onPress={() => onIdentityPress(item.publicKey)}
			title={item.displayName}
			description={item.publicKey}
			left={(props) => (
				<Image
					source={{ uri: emitter.getAvatar(item.publicKey) }}
					{...props}
					style={{ width: 48, height: 48, borderRadius: 24 }}
				/>
			)}
		/>
	);

	return loading ? (
		<SafeAreaView
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
			}}
		>
			<ActivityIndicator size="large" />
		</SafeAreaView>
	) : (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
				paddingTop: 48,
			}}
		>
			<FlatList data={identities} renderItem={renderIdentity} />
			<FAB
				icon="plus"
				label="Create Identity"
				onPress={() => setPrompt(true)}
				style={{
					position: "absolute",
					bottom: 0,
					right: 0,
					margin: 25,
				}}
			/>
			<Portal>
				<Dialog visible={prompt} onDismiss={cancelIdentity}>
					<Dialog.Title>Create New Identity</Dialog.Title>
					<Dialog.Content>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "flex-start",
								marginBottom: 20,
							}}
						>
							<TouchableNativeFeedback onPress={pickPhoto}>
								{!!avatar ? (
									<Image
										source={{ uri: avatar }}
										style={{
											width: 48,
											height: 48,
											borderRadius: 24,
										}}
									/>
								) : (
									<Icon name="account" size={48} />
								)}
							</TouchableNativeFeedback>
							<TextInput
								autoFocus={true}
								value={name}
								onChangeText={setName}
								style={{
									width: "80%",
									marginLeft: 15,
								}}
								label="Name"
							/>
						</View>
						<TextInput
							value={bio}
							onChangeText={setBio}
							onSubmitEditing={createIdentity}
							numberOfLines={3}
							label="Bio"
						/>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={cancelIdentity}>Cancel</Button>
						<Button onPress={createIdentity}>Create</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</SafeAreaView>
	);
};
