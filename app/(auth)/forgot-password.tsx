import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!phone.trim()) return;
    setIsLoading(true);
    try {
      await authService.resetPassword(phone.trim());
      setSent(true);
    } catch (e: any) {
      Alert.alert('错误', e?.message || '发送重置链接失败');
    } finally {
      setIsLoading(false);
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
        <View style={{ marginBottom: theme.space[8] }}>
          <Text style={[theme.text.h1, { color: theme.colors.textPrimary, marginBottom: theme.space[1] }]}>
            重置密码
          </Text>
          <Text style={[theme.text.body, { color: theme.colors.textSecondary }]}>
            {sent
              ? '重置链接已发送，请检查您的邮箱'
              : '请输入注册时使用的手机号码'}
          </Text>
        </View>

        {!sent ? (
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
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleReset}
            >
              发送重置链接
            </Button>
          </View>
        ) : null}

        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => router.back()}
          style={{ marginTop: theme.space[4] }}
        >
          返回登录
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
