import React, { useState, useEffect, ChangeEvent } from 'react';
import { View, ImageBackground, Image, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

import { Feather as Icon } from '@expo/vector-icons';

interface IBGEUFResponse {
	sigla: string;
};

interface IBGECityResponse {
	nome: string;
};

interface SelectItem {
	label: string,
	value: string
}

interface HomeState {
	selectedUf: string;
	selectedCity: string;
	ufs: SelectItem[];
	cities: SelectItem[];
}

const placeholderUf = {
	label: 'Select a state...',
	value: null,
};

const placeholderCity = {
	label: 'Select a city...',
	value: null,
};

const Home = () => {
	const [state, setState] = useState<HomeState>({
		selectedUf: "",
		selectedCity: "",
		ufs: [{ label: "", value: "" }],
		cities: [{ label: "", value: "" }],
	});

	const navigation = useNavigation();

	const handleNavigateToPoints = () => {
		navigation.navigate("Points", {
			uf: state.selectedUf,
			city: state.selectedCity,
		});
	}

	useEffect(() => {
		axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
			.then(response => {
				const ufInitials = response.data.map(uf => {
					return {
						value: uf.sigla,
						label: uf.sigla
					};
				});

				setState({
					...state,
					ufs: ufInitials
				});
			});
	}, []);


	useEffect(() => {
		if (state.selectedUf === '') {
			return;
		}
		axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.selectedUf}/municipios`)
			.then(response => {
				const cityNames = response.data.map(city => {
					return {
						value: city.nome,
						label: city.nome
					};
				});
				setState({
					...state,
					cities: cityNames
				})
			});
	}, [state.selectedUf]);

	const handleSelectUf = (value: string) => {
		const uf = value;
		setState({
			...state,
			selectedUf: uf
		})
	};

	const handleSelectCity = (value: string) => {
		const city = value;
		setState({
			...state,
			selectedCity: city
		})
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ImageBackground
				source={require('../../assets/home-background.png')}
				style={styles.container}
				imageStyle={{
					width: 274,
					height: 368
				}}
			>
				<View style={styles.main}>
					<View style={styles.header}>
						<Image source={require('../../assets/logo-sample.png')} />
						<Text style={styles.appName}>Discard Pile</Text>
					</View>
					<View>
						<Text style={styles.title}>
							Your waste collection marketplace
        		</Text>
						<Text style={styles.description}>
							We help people find collection points to discard their waste.
        		</Text>
					</View>
				</View>

				<View style={styles.footer}>
					<RNPickerSelect
						placeholder={placeholderUf}
						style={pickerSelectStyles}
						items={state.ufs}
						value={state.selectedUf}
						onValueChange={handleSelectUf}
					/>
					<RNPickerSelect
						placeholder={placeholderCity}
						style={pickerSelectStyles}
						items={state.cities}
						value={state.selectedCity}
						onValueChange={handleSelectCity}
					/>
					<RectButton style={styles.button} onPress={handleNavigateToPoints}>
						<View style={styles.buttonIcon}>
							<Text>
								<Icon name="arrow-right" color="#FFF" size={24} />
							</Text>
						</View>
						<Text style={styles.buttonText}>
							Find now!
          </Text>
					</RectButton>
				</View>
			</ImageBackground>
		</KeyboardAvoidingView>
	);
};

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: 'gray',
		borderRadius: 4,
		color: 'black',
		paddingRight: 30, // to ensure the text is never behind the icon
	},
	inputAndroid: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderWidth: 0.5,
		borderColor: 'purple',
		borderRadius: 8,
		color: 'black',
		paddingRight: 30, // to ensure the text is never behind the icon
	},
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 32,
	},

	main: {
		flex: 1,
		justifyContent: 'center',
	},

	header: {
		flex: 1,
		alignItems: 'center',
		flexDirection: 'row',
		marginTop: 64,
	},

	title: {
		color: '#322153',
		fontSize: 32,
		fontFamily: 'Ubuntu_700Bold',
		maxWidth: 260,
		marginTop: 64,
	},

	appName: {
		color: '#322153',
		fontSize: 24,
		fontFamily: 'Ubuntu_700Bold',
		maxWidth: 260,
		marginLeft: 16,
	},

	description: {
		color: '#6C6C80',
		fontSize: 16,
		marginTop: 16,
		marginBottom: 16,
		fontFamily: 'Roboto_400Regular',
		maxWidth: 260,
		lineHeight: 24,
	},

	footer: {},

	input: {
		height: 60,
		backgroundColor: '#FFF',
		borderRadius: 10,
		marginBottom: 8,
		paddingHorizontal: 24,
		fontSize: 16,
	},

	button: {
		backgroundColor: '#34CB79',
		height: 60,
		flexDirection: 'row',
		borderRadius: 10,
		overflow: 'hidden',
		alignItems: 'center',
		marginTop: 8,
	},

	buttonIcon: {
		height: 60,
		width: 60,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		justifyContent: 'center',
		alignItems: 'center'
	},

	buttonText: {
		flex: 1,
		justifyContent: 'center',
		textAlign: 'center',
		color: '#FFF',
		fontFamily: 'Roboto_500Medium',
		fontSize: 16,
	}
});

export default Home;