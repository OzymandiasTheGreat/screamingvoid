import React, { useContext, useEffect, useState } from "react";
import {
	FlatList,
	Image,
	SafeAreaView,
	TouchableOpacity,
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
import { Buffer } from "buffer";
import sodium from "@screamingvoid/sodium-universal";
import { invoke } from "@tauri-apps/api";
import { Store } from "tauri-plugin-store-api";
import type { SavedIdentity } from "./interface";
import { VoidContext } from "./context";

export const Login: React.FC = ({ prefs }) => {
	const emitter = useContext(VoidContext);
	const [iddb, setIdDB] = useState<Store>();
	const [identities, setIdentities] = useState<SavedIdentity[]>([]);
	const [prompt, setPrompt] = useState(false);
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [avatar, setAvatar] = useState("");
	const [base64, setBase64] = useState("");

	useEffect(() => {
		const db = new Store(".void-identity");
		setIdDB(db);

		(async () => {
			const ids = [];
			for (let json of await db.values()) {
				ids.push(JSON.parse(json));
			}
			setIdentities(ids);
		})();
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
		iddb?.set(
			id.publicKey,
			JSON.stringify({
				displayName: id.displayName,
				publicKey: id.publicKey,
			})
		)
			.then(() =>
				invoke("set_identity", {
					publicKey: id.publicKey,
					identity: JSON.stringify(id),
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
				return iddb.save();
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
		invoke("get_identity", { publicKey: pk }).then((json) => {
			emitter.emit(["request", "open"], JSON.parse(json as string));
		});
	};

	const renderIdentity = ({ item }: { item: SavedIdentity }) => (
		<TouchableOpacity onPress={() => onIdentityPress(item.publicKey)}>
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
		</TouchableOpacity>
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
							<TouchableOpacity onPress={pickPhoto}>
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
							</TouchableOpacity>
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
