import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { productService } from '../../../services/productService';

export default function ProductScanScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScannedRef = useRef<string | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBarCodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      const { data } = result;

      if (isProcessing) return;
      if (data === lastScannedRef.current) return;

      lastScannedRef.current = data;
      setIsProcessing(true);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const product = await productService.findByBarcode(data);

        if (product) {
          router.replace(`/(tabs)/products/${product.id}`);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('未找到商品', `未找到条码 "${data}" 对应的商品`, [
            {
              text: '确定',
              onPress: () => {
                scanTimeoutRef.current = setTimeout(() => {
                  lastScannedRef.current = null;
                  setIsProcessing(false);
                }, 1500);
              },
            },
          ]);
          return;
        }
      } catch (e: unknown) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('查询失败', e instanceof Error ? e.message : '未知错误', [
          {
            text: '确定',
            onPress: () => {
              scanTimeoutRef.current = setTimeout(() => {
                lastScannedRef.current = null;
                setIsProcessing(false);
              }, 1500);
            },
          },
        ]);
      }
    },
    [isProcessing],
  );

  React.useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []);

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bgPrimary, paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + 8 }]}
        >
          <Text style={[theme.text.body, { color: theme.colors.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <View style={styles.centerContent}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📷</Text>
          <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 8 }]}>
            需要相机权限
          </Text>
          <Text style={[theme.text.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
            请授权相机权限以使用扫码功能
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: theme.radius.md,
            }}
          >
            <Text style={[theme.text.bodyMedium, { color: '#FFFFFF' }]}>授予权限</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13', 'ean8', 'upc_a', 'upc_e',
            'code128', 'code39', 'code93', 'codabar', 'itf14',
            'qr', 'pdf417', 'datamatrix',
          ],
        }}
        onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
      />

      {/* Viewfinder overlay */}
      <View style={styles.overlay}>
        <View style={[styles.overlayTop, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[theme.text.body, { color: '#FFFFFF' }]}>← 返回</Text>
          </TouchableOpacity>
          <Text style={[theme.text.bodyMedium, { color: '#FFFFFF', marginTop: 8 }]}>
            将条码对准取景框
          </Text>
        </View>

        <View style={styles.viewfinderRow}>
          <View style={styles.overlaySide} />
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.overlaySide} />
        </View>

        <View style={styles.overlayBottom}>
          <Text style={[theme.text.caption, { color: 'rgba(255,255,255,0.7)', textAlign: 'center' }]}>
            扫码后自动查询匹配商品
          </Text>
        </View>
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_BORDER = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  backBtn: { paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  overlayTop: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.4)' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  viewfinderRow: { flexDirection: 'row', height: 250 },
  viewfinder: { width: 250, height: 250, position: 'relative' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER,
    borderColor: '#2563EB', borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER,
    borderColor: '#2563EB', borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER,
    borderColor: '#2563EB', borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER,
    borderColor: '#2563EB', borderBottomRightRadius: 4,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(37,99,235,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  overlayBottom: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16,
  },
});
