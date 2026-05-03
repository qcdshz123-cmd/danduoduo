import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, isLoading } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!phone.trim()) { setError('请输入手机号'); return; }
    if (!password.trim()) { setError('请输入密码'); return; }

    try {
      await signIn(phone.trim(), password);
      router.replace('/(tabs)/products');
    } catch (e: any) {
      setError(e?.message || '登录失败，请重试');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: theme.space[6],
          paddingBottom: insets.bottom + theme.space[8],
        }}
      >
        {/* Logo & Title */}
        <View style={{ alignItems: 'center', marginBottom: theme.space[8] }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: theme.radius['2xl'],
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.space[4],
              ...theme.shadows.lg,
            }}
          >
            <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '700' }}>速</Text>
          </View>
          <Text style={[theme.text.h1, { color: theme.colors.textPrimary, marginBottom: theme.space[1] }]}>
            欢迎回来
          </Text>
          <Text style={[theme.text.body, { color: theme.colors.textSecondary }]}>
            登录您的速订货账户
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: theme.space[4] }}>
          <Input
            label="手机号"
            placeholder="请输入手机号码"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={11}
            autoCapitalize="none"
          />
          <Input
            label="密码"
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
          />
          {error ? (
            <Text style={[theme.text.caption, { color: theme.colors.danger }]}>
              {error}
            </Text>
          ) : null}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleLogin}
          >
            登录
          </Button>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ alignItems: 'center' }}
          >
            <Text style={[theme.text.bodySmall, { color: theme.colors.primary }]}>
              忘记密码?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: theme.space[6],
            gap: theme.space[3],
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.borderLight }} />
          <Text style={[theme.text.caption, { color: theme.colors.textTertiary }]}>或</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.borderLight }} />
        </View>

        {/* Register */}
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/register')}
        >
          注册新账户
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
