import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function RegisterScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signUp, isLoading } = useAuth();

  const [storeName, setStoreName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!storeName.trim()) { setError('请输入店铺名称'); return; }
    if (!displayName.trim()) { setError('请输入您的姓名'); return; }
    if (!phone.trim()) { setError('请输入手机号'); return; }
    if (password.length < 6) { setError('密码至少6个字符'); return; }
    if (password !== confirmPassword) { setError('两次密码不一致'); return; }

    try {
      await signUp(phone.trim(), password, displayName.trim(), storeName.trim());
      router.replace('/(auth)/login');
      Alert.alert('注册成功', '请前往邮箱验证，或联系管理员激活账户。');
    } catch (e: any) {
      setError(e?.message || '注册失败，请重试');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: theme.space[6],
          paddingBottom: insets.bottom + theme.space[8],
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={{ marginBottom: theme.space[8] }}>
          <Text style={[theme.text.h1, { color: theme.colors.textPrimary, marginBottom: theme.space[1] }]}>
            创建账户
          </Text>
          <Text style={[theme.text.body, { color: theme.colors.textSecondary }]}>
            注册您的店铺开始使用速订货
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: theme.space[4] }}>
          <Input
            label="店铺名称"
            placeholder="请输入您的店铺名称"
            value={storeName}
            onChangeText={setStoreName}
            autoCapitalize="words"
          />
          <Input
            label="您的姓名"
            placeholder="请输入您的姓名"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
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
            placeholder="至少6个字符"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
          />
          <Input
            label="确认密码"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            onPress={handleRegister}
          >
            注册
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => router.back()}
          >
            已有账户？去登录
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
