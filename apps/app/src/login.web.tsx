import React, { useContext, useEffect, useState } from "react";
import {
	useColorScheme,
	FlatList,
	Image,
	SafeAreaView,
	TouchableOpacity,
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
import * as ImagePicker from "expo-image-picker";
import { Buffer } from "buffer";
import sodium from "@screamingvoid/sodium-universal";
import { invoke } from "@tauri-apps/api";
import { Store } from "tauri-plugin-store-api";
import type { SavedIdentity } from "./interface";
import { VoidContext } from "./context";
import { PRIMARY_DARK, PRIMARY_LIGHT } from "./colors";

export const Login: React.FC = () => {
	const emitter = useContext(VoidContext);
	const dark = useColorScheme() === "dark";
	const [iddb, setIdDB] = useState<Store>();
	const [identities, setIdentities] = useState<SavedIdentity[]>([]);
	const [prompt, setPrompt] = useState(false);
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [avatar, setAvatar] = useState("");
	const [base64, setBase64] = useState("");
	const [loading, setLoading] = useState(false);

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
	}, []);

	const pickPhoto = () => {
		ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [1, 1],
			base64: true,
			quality: 0.6,
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
				setLoading(true);
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
			setLoading(true);
			emitter.emit(["request", "open"], JSON.parse(json as string));
		});
	};

	const renderIdentity = ({ item }: { item: SavedIdentity }) => (
		<List.Item
			key={item.publicKey}
			onPress={() => onIdentityPress(item.publicKey)}
			title={item.displayName}
			description={item.publicKey}
			descriptionNumberOfLines={1}
			descriptionEllipsizeMode="middle"
			left={(props) => (
				<Image
					source={{
						uri: emitter.getAvatar(item.publicKey),
					}}
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
			}}
		>
			<FlatList data={identities} renderItem={renderIdentity} />
			<FAB
				icon="plus"
				label="Create Identity"
				onPress={() => setPrompt(true)}
				style={{
					position: "absolute",
					bottom: 16,
					right: 16,
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
