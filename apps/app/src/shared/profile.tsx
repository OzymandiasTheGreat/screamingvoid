import React, { useContext, useEffect, useState } from "react";
import { useColorScheme, Image, View } from "react-native";
import { Headline, IconButton, Text, TextInput } from "react-native-paper";
import { Modalize } from "react-native-modalize";
import { VoidContext } from "../context";
import { PRIMARY_DARK, PRIMARY_LIGHT } from "../colors";

export const Profile = React.forwardRef<Modalize, { user: string }>(
	({ user }, ref) => {
		const emitter = useContext(VoidContext);
		const dark = useColorScheme() === "dark";
		const self = user === emitter.self.id;

		const [avatar, setAvatar] = useState("");
		const [name, setName] = useState("");
		const [bio, setBio] = useState("");

		useEffect(() => {
			if (self) {
				setAvatar(emitter.getAvatar(user));
				setName(emitter.self.name as string);
				setBio(emitter.self.bio as string);
			} else {
				const listener = emitter.on(["peer", user], (peer) => {
					setAvatar(emitter.getAvatar(peer.id));
					setName(peer.name);
					setBio(peer.bio);
				});
				emitter.emit(["request", "peer"], user);
				return () => {
					listener.off();
				};
			}
		}, [user]);

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
						<View>
							<IconButton
								icon={() => (
									<Image
										source={{
											uri: avatar,
											width: 128,
											height: 128,
										}}
										borderRadius={64}
									/>
								)}
								size={128}
							/>
							{self && (
								<IconButton
									icon="image"
									style={{
										position: "absolute",
										bottom: 25,
										right: 25,
									}}
								/>
							)}
						</View>
						<Headline>
							{name}
							{self && <IconButton icon="pen" />}
						</Headline>
						<Text>
							{bio}
							{self && <IconButton icon="pen" />}
						</Text>
					</View>
				}
			/>
		);
	}
);
