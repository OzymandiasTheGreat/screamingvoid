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
import Sodium from "@screamingvoid/sodium-universal";
import { invoke } from "@tauri-apps/api";
import { Store } from "tauri-plugin-store-api";
import type { SavedIdentity } from "./types/identity";
import { TouchableHighlight } from "react-native";
import { SafeAreaView } from "react-native";
import { FlatList } from "react-native";
import { VoidContext } from "./ctx";

export const Login: React.FC = () => {
	const emitter = useContext(VoidContext);
	const [iddb, setIdDB] = useState<Store>();
	const [identities, setIdentities] = useState<SavedIdentity[]>([]);
	const [prompt, setPrompt] = useState(false);
	const [idname, setIdName] = useState("");

	useEffect(() => {
		const iddb = new Store(".void-identity");
		setIdDB(iddb);

		(async () => {
			setIdentities(
				(await iddb.values()).map((json) => JSON.parse(json)),
			);
		})();
	}, []);

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
		iddb?.set(
			id.publicKey,
			JSON.stringify({ name: id.name, publicKey: id.publicKey }),
		)
			.then(() =>
				invoke("set_identity", {
					publicKey: id.publicKey,
					identity: JSON.stringify(id),
				}),
			)
			.then(() => {
				setIdName("");
				setPrompt(false);
				emitter.emit("requestLoad", id);
				return iddb.save();
			});
	};
	const cancelId = () => {
		setIdName("");
		setPrompt(false);
	};

	const onIdPress = (pk: string) => {
		invoke("get_identity", { publicKey: pk }).then((json) => {
			emitter.emit("requestLoad", JSON.parse(json as string));
		});
	};

	const renderId = ({ item }: { item: SavedIdentity }) => (
		<TouchableHighlight onPress={() => onIdPress(item.publicKey)}>
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
		</TouchableHighlight>
	);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FlatList
				data={identities}
				renderItem={renderId}
				keyExtractor={(item) => item.publicKey}
			/>
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
							onSubmitEditing={createNewIdentity}
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
