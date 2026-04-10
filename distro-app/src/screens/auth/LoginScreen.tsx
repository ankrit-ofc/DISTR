import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput as TI } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { spacing } from "../../lib/theme";
import { AuthStackParamList } from "../../navigation/AuthStack";
import { AuthBrand, InputField, AuthError, s } from "./_shared";

type Props = { navigation: StackNavigationProp<AuthStackParamList, "Login"> };

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const passwordRef = useRef<TI>(null);

  const btnScale = useSharedValue(1);
  const errorShake = useSharedValue(0);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const errorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: errorShake.value }] }));

  const shake = () => {
    errorShake.value = withSequence(
      withTiming(-8, { duration: 60 }), withTiming(8, { duration: 60 }),
      withTiming(-6, { duration: 60 }), withTiming(6, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Enter your email/phone and password.");
      shake();
      return;
    }
    setError("");
    setLoading(true);
    btnScale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
    try {
      const res = await api.post("/auth/login", { email: identifier, password });
      await setAuth(res.data.token, res.data.user ?? res.data.profile);
      btnScale.value = withSpring(1);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Login failed. Try again.");
      btnScale.value = withSpring(1);
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthBrand subtitle="Sign in to your wholesale account" />

        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back 👋</Text>
          <View style={s.fields}>
            <InputField label="Email or Phone" value={identifier} onChangeText={setIdentifier}
              placeholder="yourshop@gmail.com or 98XXXXXXXX" keyboardType="email-address"
              returnKeyType="next" onSubmitEditing={() => (passwordRef.current as any)?.focus()}
              autoCapitalize="none" />
            <InputField label="Password" value={password} onChangeText={setPassword}
              placeholder="Enter your password" secureTextEntry returnKeyType="done"
              onSubmitEditing={handleLogin} inputRef={passwordRef} autoCapitalize="none" />
          </View>
          <AuthError message={error} animStyle={errorStyle} />
          <Animated.View style={btnStyle}>
            <TouchableOpacity style={[s.btn, loading && s.btnLoading]} onPress={handleLogin}
              disabled={loading} activeOpacity={0.88}>
              {loading
                ? <View style={s.loadingRow}>
                    <View style={s.loadingDot} />
                    <View style={[s.loadingDot, s.loadingDotMid]} />
                    <View style={[s.loadingDot, s.loadingDotFaint]} />
                  </View>
                : <Text style={s.btnText}>Sign in</Text>}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={s.divider}>
          <View style={s.dividerLine} /><Text style={s.dividerText}>or</Text><View style={s.dividerLine} />
        </View>
        <TouchableOpacity style={s.linkRow} onPress={() => navigation.navigate("Register")} activeOpacity={0.75}>
          <Text style={s.linkText}>New to DISTRO? </Text>
          <Text style={s.linkBold}>Register your store →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
