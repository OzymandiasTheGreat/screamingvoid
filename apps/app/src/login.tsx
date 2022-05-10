import React, { useContext, useEffect, useState } from "react";
import {
	FlatList,
	Image,
	SafeAreaView,
	TouchableNativeFeedback,
	View,
} from "react-native";
import {
	Button,
	Dialog,
	FAB,
	Portal,
	Subheading,
	TextInput,
	Title,
} from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import sodium from "sodium-universal";
import type { LevelUp } from "levelup";
import sublevel from "subleveldown";
import type { SavedIdentity } from "./interface";
import { VoidContext } from "./context";

export const Login: React.FC<{ prefs?: LevelUp }> = ({ prefs }) => {
	const emitter = useContext(VoidContext);
	const [iddb, setIdDB] = useState<LevelUp>();
	const [identities, setIdentities] = useState<SavedIdentity[]>([]);
	const [prompt, setPrompt] = useState(false);
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [avatar, setAvatar] = useState("");
	const [base64, setBase64] = useState("");

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
		const enc = Buffer.alloc(32);
		sodium.crypto_sign_keypair(pk, sk);
		sodium.randombytes_buf(enc);
		const id: SavedIdentity = {
			displayName: name,
			publicKey: pk.toString("hex"),
			secretKey: sk.toString("hex"),
			encryptionKey: enc.toString("hex"),
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
				const id = JSON.parse(json);
				emitter.emit(["request", "open"], id);
			}
		});
	};

	const renderIdentity = ({ item }: { item: SavedIdentity }) => (
		<TouchableNativeFeedback
			onPress={() => onIdentityPress(item.publicKey)}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "flex-start",
					justifyContent: "flex-start",
					paddingVertical: 10,
					paddingHorizontal: 15,
				}}
			>
				<Image
					source={{ uri: emitter.getAvatar(item.publicKey) }}
					style={{
						width: 48,
						height: 48,
						borderRadius: 24,
					}}
				/>
				<View style={{ marginLeft: 15 }}>
					<Title>{item.displayName}</Title>
					<Subheading ellipsizeMode="middle" numberOfLines={1}>
						{item.publicKey}
					</Subheading>
				</View>
			</View>
		</TouchableNativeFeedback>
	);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FlatList data={identities} renderItem={renderIdentity} />
			<FAB
				icon="plus"
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