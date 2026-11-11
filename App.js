import { createElement, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { WebView } from 'react-native-webview';
import { links } from './links';

const FARMACIA_HTML = require('./assets/funcionamento-farmacias.html');
const APP_LOGO = require('./assets/logo.png');

export default function App() {
  const [screen, setScreen] = useState('home');
  const [html, setHtml] = useState(null);
  const [htmlError, setHtmlError] = useState('');
  const { width } = useWindowDimensions();
  const compact = width < 380;

  useEffect(() => {
    if (screen !== 'schedule' || html) return undefined;

    let active = true;
    async function loadHtml() {
      try {
        const asset = Asset.fromModule(FARMACIA_HTML);
        await asset.downloadAsync();
        let content;
        if (Platform.OS === 'web') {
          const response = await fetch(asset.uri);
          if (!response.ok) {
            throw new Error(`Não foi possível carregar o arquivo HTML (${response.status}).`);
          }
          content = await response.text();
        } else {
          if (!asset.localUri) {
            throw new Error('O arquivo HTML não foi encontrado no dispositivo.');
          }
          content = await FileSystem.readAsStringAsync(asset.localUri);
        }
        if (active) {
          setHtml(content);
          setHtmlError('');
        }
      } catch (error) {
        if (active) {
          setHtmlError(
            error instanceof Error ? error.message : 'Não foi possível abrir o conteúdo.',
          );
        }
      }
    }

    loadHtml();
    return () => {
      active = false;
    };
  }, [screen, html]);

  async function openExternalLink(url) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Não foi possível abrir o link', 'Verifique sua conexão e tente novamente.');
    }
  }

  function handleWebViewNavigation(request) {
    const url = request.url || '';
    if (url === 'about:blank' || url.startsWith('data:')) return true;

    if (/^(https?:|mailto:|tel:)/i.test(url)) {
      openExternalLink(url);
      return false;
    }

    return true;
  }

  if (screen === 'schedule') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F8FF" />
        <View style={styles.webHeader}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela inicial"
            onPress={() => setScreen('home')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#123B70" />
          </TouchableOpacity>
          <Text style={styles.webHeaderTitle}>Funcionamento das farmácias</Text>
          <View style={styles.headerSpacer} />
        </View>
        {htmlError ? (
          <View style={styles.messageContainer}>
            <Ionicons name="alert-circle-outline" size={42} color="#C34747" />
            <Text style={styles.errorTitle}>Não foi possível abrir o conteúdo</Text>
            <Text style={styles.messageText}>{htmlError}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                setHtmlError('');
                setHtml(null);
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : html && Platform.OS === 'web' ? (
          createElement('iframe', {
            title: 'Funcionamento das farmácias',
            srcDoc: html,
            sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation',
            style: {
              flex: 1,
              width: '100%',
              border: 0,
              backgroundColor: '#FFFFFF',
            },
          })
        ) : html ? (
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            onShouldStartLoadWithRequest={handleWebViewNavigation}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#1769D2" />
                <Text style={styles.messageText}>Carregando informações...</Text>
              </View>
            )}
            style={styles.webView}
          />
        ) : (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1769D2" />
            <Text style={styles.messageText}>Carregando informações...</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E4FA8" />
      <ScrollView
        contentContainerStyle={[styles.homeContent, compact && styles.compactContent]}
        alwaysBounceVertical={false}
      >
        <View style={styles.topSection}>
          <Image source={APP_LOGO} style={styles.brandLogo} resizeMode="contain" />
          <Text style={styles.brandName}>AquiTemFarmacia</Text>
          <Text style={styles.brandTagline}>Cuidado e informação perto de você</Text>
        </View>

        <View style={[styles.card, compact && styles.compactCard]}>
          <Text style={styles.greeting}>Olá!</Text>
          <Text style={styles.description}>
            Consulte o funcionamento das farmácias ou encontre opções em Araquari.
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ver funcionamento das farmácias"
            onPress={() => setScreen('schedule')}
            style={styles.primaryButton}
          >
            <View style={styles.buttonIcon}>
              <Ionicons name="time-outline" size={25} color="#FFFFFF" />
            </View>
            <View style={styles.buttonCopy}>
              <Text style={styles.primaryButtonTitle}>Funcionamento</Text>
              <Text style={styles.primaryButtonSubtitle}>Veja horários e plantões</Text>
            </View>
            <Ionicons name="chevron-forward" size={21} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Encontrar farmácias no Google Maps"
            onPress={() => openExternalLink(links.findPharmacies)}
            style={styles.secondaryButton}
          >
            <View style={styles.secondaryIcon}>
              <Ionicons name="location-outline" size={25} color="#1769D2" />
            </View>
            <View style={styles.buttonCopy}>
              <Text style={styles.secondaryButtonTitle}>Encontrar farmácias</Text>
              <Text style={styles.secondaryButtonSubtitle}>Buscar opções em Araquari</Text>
            </View>
            <Ionicons name="open-outline" size={19} color="#1769D2" />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Informação para cuidar melhor de você.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FF',
  },
  homeContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: '#F4F8FF',
  },
  compactContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandLogo: {
    width: 112,
    height: 112,
    marginBottom: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#123B70',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  brandName: {
    color: '#123B70',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTagline: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#123B70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  compactCard: {
    padding: 18,
  },
  greeting: {
    color: '#123B70',
    fontSize: 23,
    fontWeight: '700',
  },
  description: {
    marginTop: 8,
    marginBottom: 22,
    color: '#64748B',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#1769D2',
  },
  buttonIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  buttonCopy: {
    flex: 1,
    marginHorizontal: 12,
  },
  primaryButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonSubtitle: {
    marginTop: 3,
    color: '#E7F1FF',
    fontSize: 12,
  },
  secondaryButton: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D5E4F8',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  secondaryIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#EAF3FF',
  },
  secondaryButtonTitle: {
    color: '#123B70',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonSubtitle: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 12,
  },
  footer: {
    maxWidth: 280,
    marginTop: 22,
    color: '#7B8DA5',
    fontSize: 12,
    textAlign: 'center',
  },
  webHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#F4F8FF',
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webHeaderTitle: {
    flex: 1,
    color: '#123B70',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 42,
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    marginTop: 12,
    color: '#123B70',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  messageText: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1769D2',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
