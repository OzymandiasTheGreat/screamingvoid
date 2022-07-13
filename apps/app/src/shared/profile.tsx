import React, { useContext, useEffect, useState } from "react";
import { useColorScheme, Image, View } from "react-native";
import { FAB, Headline, IconButton, Text, TextInput } from "react-native-paper";
import { Modalize } from "react-native-modalize";
import * as ImagePicker from "expo-image-picker";
import { VoidContext } from "../context";
import { PRIMARY_DARK, PRIMARY_LIGHT } from "../colors";

export const Profile = React.forwardRef<Modalize, { user?: string }>(
	({ user }, ref) => {
		const emitter = useContext(VoidContext);
		const dark = useColorScheme() === "dark";
		const self = user === emitter.self.id;

		const [avatar, setAvatar] = useState("");
		const [name, setName] = useState("");
		const [bio, setBio] = useState("");

		const [editing, setEditing] = useState(false);
		const [newAvatar, setNewAvatar] = useState("");
		const [newName, setNewName] = useState("");
		const [newBio, setNewBio] = useState("");

		useEffect(() => {
			if (user) {
				if (self) {
					setAvatar(emitter.getAvatar(user));
					setName(emitter.self.name as string);
					setBio(emitter.self.bio as string);
				} else {
					const listener = emitter.once(
						["peer", user],
						(peer) => {
							setAvatar(emitter.getAvatar(peer.id));
							setName(peer.name);
							setBio(peer.bio);
						},
						{ objectify: true }
					);
					emitter.emit(["request", "peer"], user);
					return () => {
						(listener as any).off();
					};
				}
			}
		}, [user]);

		const edit = () => {
			setNewAvatar(avatar);
			setNewName(name);
			setNewBio(bio);
			setEditing(true);
		};

		const save = () => {
			emitter.once(["update", "profile"], ({ id, name, bio }) => {
				setAvatar(emitter.getAvatar(id));
				setName(name);
				setBio(bio);
			});
			emitter.updateProfile({
				avatar: newAvatar === avatar ? undefined : newAvatar,
				name: newName,
				bio: newBio,
			});
			setEditing(false);
		};

		const pickAvatar = () =>
			ImagePicker.launchImageLibraryAsync({
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.6,
			}).then((image) => {
				if (!image.cancelled) {
					setNewAvatar(image.uri);
				}
			});

		return (
			<Modalize
				ref={ref}
				childrenStyle={{
					backgroundColor: dark ? PRIMARY_DARK : PRIMARY_LIGHT,
				}}
				adjustToContentHeight
				withHandle={false}
				HeaderComponent={
					<View
						style={{
							width: "100%",
							height: 384,
							alignItems: "center",
							justifyContent: "space-around",
							backgroundColor: dark
								? PRIMARY_DARK
								: PRIMARY_LIGHT,
						}}
					>
						<IconButton
							icon={() => (
								<Image
									source={{
										uri: editing ? newAvatar : avatar,
										width: 128,
										height: 128,
									}}
									style={{ borderRadius: 64 }}
								/>
							)}
							size={128}
							onPress={self && editing ? pickAvatar : undefined}
						/>
						{self && editing ? (
							<View style={{ height: 64, width: 256 }}>
								<TextInput
									label="Name"
									value={newName}
									onChangeText={setNewName}
									right={
										<TextInput.Icon
											name="close"
											onPress={() => setNewName(name)}
										/>
									}
								/>
							</View>
						) : (
							<Headline>{name}</Headline>
						)}
						{self && editing ? (
							<View
								style={{
									minHeight: 64,
									maxHeight: 96,
									width: 256,
								}}
							>
								<TextInput
									label="Bio"
									multiline
									value={newBio}
									onChangeText={setNewBio}
									right={
										<TextInput.Icon
											name="close"
											onPress={() => setNewBio(bio)}
										/>
									}
								/>
							</View>
						) : (
							<Text>{bio}</Text>
						)}
						{self && (
							<FAB
								icon={editing ? "content-save" : "pen"}
								style={{
									position: "absolute",
									bottom: 16,
									right: 16,
								}}
								onPress={editing ? save : edit}
							/>
						)}
					</View>
				}
			/>
		);
	}
);
