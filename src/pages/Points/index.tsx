import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { SvgUri } from 'react-native-svg';
import MapView, { Marker } from 'react-native-maps';

import { Feather as Icon } from '@expo/vector-icons';

import api from '../../services/api';

import * as Location from "expo-location";


interface Item {
	id: number,
	title: string,
	image_url: string,
};

interface Point {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	image: string;
	image_url: string;
};

interface Params {
	uf: string;
	city: string;
};

interface PointsState {
	items: Item[]
	points: Point[],
	selectedItems: number[],
	initialPosition: [number, number],
};

const Points = () => {
	const _isMounted = useRef(true); 
	const [state, setState] = useState<PointsState>({
		items: [],
		points: [],
		selectedItems: [],
		initialPosition: [0, 0],
	});

	const navigation = useNavigation();
	const route = useRoute();

	const routeParams = route.params as Params;

	useEffect(() => {
		async function loadPoints() {
			const response = await api.get("/points", {
				params: {
					city: routeParams.city,
					uf: routeParams.uf,
					items: state.selectedItems,
				},
			});

			setState({
				...state,
				points: response.data
			});
		}

		loadPoints();
	}, [state.selectedItems]);

	useEffect(() => {
		async function loadPosition() {
			const { status } = await Location.requestPermissionsAsync();

			if (status !== "granted") {
				Alert.alert(
					"Oops...",
					"We need your permission to show your location"
				);
				return;
			}

			const location = await Location.getCurrentPositionAsync({
				enableHighAccuracy: true,
			});

			const { latitude, longitude } = location.coords;

			setState({
				...state,
				initialPosition: [latitude, longitude]
			});
		}

		loadPosition();
	}, []);

	useEffect(() => {
		async function loadItems() {
			const response = await api.get("/items");
			console.log('CHAMEI ITENS', response.data)
			setState({
				...state,
				items: response.data
			});
		};

		loadItems();
	}, []);

	useEffect(() => {
    return () => {
        _isMounted.current = false;
    }
  }, []);

	const handleNavigateBack = () => {
		navigation.goBack();
	};

	const handleNavigateToDetails = (id: number) => {
		navigation.navigate("Details", { point_id: id });
	};

	const handleSelectItem = (id: number) => {
		const alreadySelected = state.selectedItems.findIndex((item) => item === id);

		if (alreadySelected >= 0) {
			const filteredItems = state.selectedItems.filter((item) => item !== id);

			setState({
				...state,
				selectedItems: filteredItems
			});
		} else {
			setState({
				...state,
				selectedItems: [...state.selectedItems, id]
			});
		}
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.container}>
				<TouchableOpacity>
					<Icon name="arrow-left" size={20} color="#34cb79" onPress={handleNavigateBack} />
				</TouchableOpacity>

				<Text style={styles.title}>
					Welcome!
        </Text>
				<Text style={styles.description}>
					Find collection points near you.
        </Text>

				<View style={styles.mapContainer}>
					{state.initialPosition[0] !== 0 && (
						<MapView
							style={styles.map}
							initialRegion={{
								latitude: state.initialPosition[0],
								longitude: state.initialPosition[1],
								latitudeDelta: 0.014,
								longitudeDelta: 0.014,
							}}
						>
							{state.points.map((point) => (
								<Marker
									key={String(point.id)}
									style={styles.mapMarker}
									onPress={() => handleNavigateToDetails(point.id)}
									coordinate={{
										latitude: point.latitude,
										longitude: point.longitude,
									}}
								>
									<View style={styles.mapMarkerContainer}>
										<Image
											style={styles.mapMarkerImage}
											source={{
												uri: point.image_url,
											}}
										/>
										<Text style={styles.mapMarkerTitle}>{point.name}</Text>
									</View>
								</Marker>
							))}
						</MapView>
					)}
				</View>
			</View>
			<View style={styles.itemsContainer}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						paddingHorizontal: 24
					}}
				>
					{state.items.map(item => (
						<TouchableOpacity
							key={String(item.id)}
							style={[
								styles.item,
								state.selectedItems.includes(item.id) ? styles.selectedItem : {}
							]}
							onPress={() => handleSelectItem(item.id)}
							activeOpacity={0.65}
						>
							<SvgUri width={42} height={42} uri={item.image_url} />
							<Text style={styles.itemTitle}>{item.title}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 32,
		paddingTop: 20
	},

	title: {
		fontSize: 20,
		fontFamily: 'Ubuntu_700Bold',
		marginTop: 24,
	},

	description: {
		color: '#6C6C80',
		fontSize: 16,
		marginTop: 4,
		fontFamily: 'Roboto_400Regular',
	},

	mapContainer: {
		flex: 1,
		width: '100%',
		maxHeight: '60%',
		borderRadius: 10,
		overflow: 'hidden',
		marginTop: 16,
	},

	map: {
		width: '100%',
		height: '100%',
	},

	mapMarker: {
		width: 90,
		height: 80,
	},

	mapMarkerContainer: {
		width: 90,
		height: 70,
		backgroundColor: '#34CB79',
		flexDirection: 'column',
		borderRadius: 8,
		overflow: 'hidden',
		alignItems: 'center'
	},

	mapMarkerImage: {
		width: 90,
		height: 45,
		resizeMode: 'cover',
	},

	mapMarkerTitle: {
		flex: 1,
		fontFamily: 'Roboto_400Regular',
		color: '#FFF',
		fontSize: 13,
		lineHeight: 23,
	},

	itemsContainer: {
		flexDirection: 'row',
		marginTop: 16,
		marginBottom: 32,
	},

	item: {
		backgroundColor: '#fff',
		borderWidth: 2,
		borderColor: '#eee',
		height: 120,
		width: 120,
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingTop: 20,
		paddingBottom: 16,
		marginRight: 8,
		alignItems: 'center',
		justifyContent: 'space-between',

		textAlign: 'center',
	},

	selectedItem: {
		borderColor: '#34CB79',
		borderWidth: 2,
	},

	itemTitle: {
		fontFamily: 'Roboto_400Regular',
		textAlign: 'center',
		fontSize: 13,
	},
});

export default Points;  