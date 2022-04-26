import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import {
	Title,
	Subheading,
	FAB,
	Portal,
	Dialog,
	TextInput,
	Button,
} from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import * as SecureStore from "expo-secure-store";
import Sodium from "sodium-universal";
import levelup from "levelup";
import sublevel from "subleveldown";
import type { SavedIdentity } from "./types/identity";
import { TouchableNativeFeedback } from "react-native";
import { SafeAreaView } from "react-native";
import { FlatList } from "react-native";
import { VoidContext } from "./ctx";

export const Login: React.FC<{
	prefs: levelup.LevelUp;
}> = ({ prefs }) => {
	const emitter = useContext(VoidContext);
	const [iddb, setIdDB] = useState<levelup.LevelUp>();
	const [identities, setIdentities] = useState<SavedIdentity[]>([]);
	const [prompt, setPrompt] = useState(false);
	const [idname, setIdName] = useState("");

	useEffect(() => {
		if (prefs) {
			const iddb = sublevel(prefs, "VOID_IDENTITY", {
				keyEncoding: "utf8",
				valueEncoding: "json",
			});
			const onPut = (key: string, value: SavedIdentity) =>
				setIdentities((ids) => [...ids, value]);
			iddb.on("put", onPut);
			setIdDB(iddb);

			(async () => {
				const ids = [];
				for await (let [key, value] of iddb.iterator() as any) {
					ids.push(value);
				}
				setIdentities(ids);
			})();

			return () => {
				iddb.off("put", onPut);
			};
		}
	}, [prefs]);

	const createNewIdentity = () => {
		const pk = Buffer.alloc(Sodium.crypto_sign_PUBLICKEYBYTES);
		const sk = Buffer.alloc(Sodium.crypto_sign_SECRETKEYBYTES);
		const key = Buffer.alloc(32);
		Sodium.crypto_sign_keypair(pk, sk);
		Sodium.randombytes_buf(key);
		const id: SavedIdentity = {
			name: idname,
			publicKey: pk.toString("hex"),
			secretKey: sk.toString("hex"),
			storageKey: key.toString("hex"),
		};
		iddb?.put(id.publicKey, { name: id.name, publicKey: id.publicKey })
			.then(() =>
				SecureStore.setItemAsync(id.publicKey, JSON.stringify(id), {
					requireAuthentication: true,
				}),
			)
			.then(() => {
				setIdName("");
				setPrompt(false);
				emitter.emit("requestLoad", id);
			});
	};
	const cancelId = () => {
		setIdName("");
		setPrompt(false);
	};

	const onIdPress = (pk: string) => {
		SecureStore.getItemAsync(pk).then((json) => {
			if (json) {
				const id = JSON.parse(json);
				emitter.emit("requestLoad", id);
			}
		});
	};

	const renderId = ({ item }: { item: SavedIdentity }) => (
		<TouchableNativeFeedback onPress={() => onIdPress(item.publicKey)}>
			<View
				style={{
					flexDirection: "row",
					alignItems: "flex-start",
					justifyContent: "flex-start",
					paddingVertical: 10,
					paddingHorizontal: 15,
				}}>
				<Icon name="account" size={32} />
				<View style={{ marginLeft: 15 }}>
					<Title>{item.name}</Title>
					<Subheading ellipsizeMode="middle" numberOfLines={1}>
						{item.publicKey}
					</Subheading>
				</View>
			</View>
		</TouchableNativeFeedback>
	);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FlatList data={identities} renderItem={renderId} />
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
				<Dialog visible={prompt} onDismiss={() => setPrompt(false)}>
					<Dialog.Title>Create New Identity</Dialog.Title>
					<Dialog.Content>
						<TextInput
							autoFocus={true}
							value={idname}
							onChangeText={setIdName}
						/>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={createNewIdentity}>Create</Button>
						<Button onPress={cancelId}>Cancel</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</SafeAreaView>
	);
};
