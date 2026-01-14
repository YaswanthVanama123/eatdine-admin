/**
 * Modern Admin Login Screen
 * Beautiful design with smooth animations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { storage } from '../api/storage';
import { Icon } from '../components/Icon';
import { theme } from '../theme';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    subdomain: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    subdomain: '',
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // Animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load previously used subdomain
  useEffect(() => {
    const loadSubdomain = async () => {
      try {
        const storedSubdomain = await storage.getSubdomain();
        if (storedSubdomain) {
          setFormData((prev) => ({ ...prev, subdomain: storedSubdomain }));
        }
      } catch (error) {
        console.error('Error loading subdomain:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadSubdomain();
  }, []);

  const validateForm = (): boolean => {
    const newErrors = {
      subdomain: '',
      username: '',
      password: '',
    };
    let isValid = true;

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Restaurant subdomain is required';
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain.trim())) {
      newErrors.subdomain = 'Only lowercase letters, numbers, and hyphens';
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.subdomain.trim().toLowerCase(), formData.username, formData.password);
      navigation.replace('Main');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', errorMessage);
      console.error('[Login] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.backgroundGradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo/Icon */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Icon name="utensils" size="3xl" color={theme.colors.primary} solid />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Restaurant Admin</Text>
            <Text style={styles.subtitle}>Sign in to your dashboard</Text>

            {/* Login Card */}
            <View style={styles.card}>
              {/* Subdomain Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Restaurant</Text>
                <View style={[styles.inputWrapper, errors.subdomain && styles.inputError]}>
                  <Icon name="store" size="sm" color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="your-restaurant"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.subdomain}
                    onChangeText={(text) => {
                      setFormData({ ...formData, subdomain: text.toLowerCase() });
                      if (errors.subdomain) setErrors({ ...errors, subdomain: '' });
                    }}
                    editable={!isLoading}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.subdomain ? (
                  <Text style={styles.errorText}>{errors.subdomain}</Text>
                ) : null}
              </View>

              {/* Username Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                  <Icon name="user" size="sm" color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter username"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.username}
                    onChangeText={(text) => {
                      setFormData({ ...formData, username: text });
                      if (errors.username) setErrors({ ...errors, username: '' });
                    }}
                    editable={!isLoading}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.username ? (
                  <Text style={styles.errorText}>{errors.username}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Icon name="lock" size="sm" color={theme.colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={formData.password}
                    onChangeText={(text) => {
                      setFormData({ ...formData, password: text });
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    editable={!isLoading}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={isLoading}
                  >
                    <Icon
                      name={showPassword ? 'eye-slash' : 'eye'}
                      size="sm"
                      color={theme.colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.textInverse} />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Sign In</Text>
                    <Icon name="arrow-right" size="sm" color={theme.colors.textInverse} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Icon name="shield-check" size="xs" color={theme.colors.textInverse} solid />
              <Text style={styles.footerText}>Secure Restaurant Management</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['3xl'],
  },
  content: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textInverse,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textInverse,
    textAlign: 'center',
    marginBottom: theme.spacing['3xl'],
    opacity: 0.95,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl,
    ...theme.shadows['2xl'],
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.base,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.errorLight,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  eyeIcon: {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    height: 56,
    marginTop: theme.spacing.base,
    ...theme.shadows.lg,
    gap: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textInverse,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing['3xl'],
    gap: theme.spacing.sm,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textInverse,
    fontWeight: theme.typography.fontWeight.medium,
    opacity: 0.9,
  },
});

export default LoginScreen;
