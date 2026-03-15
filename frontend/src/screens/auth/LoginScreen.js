import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      Alert.alert('로그인 실패', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* 로고 영역 */}
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>☕</Text>
          <Text style={styles.logoTitle}>대타 앱</Text>
          <Text style={styles.logoSub}>알바 대타 관리 플랫폼</Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            placeholderTextColor="#C0C0C0"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호 입력"
            placeholderTextColor="#C0C0C0"
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>로그인</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>계정이 없으신가요? <Text style={styles.linkBold}>회원가입</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  logoBox: { alignItems: 'center', marginBottom: 40 },
  logoEmoji: { fontSize: 64, marginBottom: 8 },
  logoTitle: { fontSize: 32, fontWeight: '800', color: '#FF7043', letterSpacing: -0.5 },
  logoSub: { fontSize: 14, color: '#9E9E9E', marginTop: 4 },
  form: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  label: { fontSize: 13, fontWeight: '600', color: '#757575', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 15, color: '#212121' },
  button: { backgroundColor: '#FF7043', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#9E9E9E', fontSize: 13 },
  linkBold: { color: '#FF7043', fontWeight: '700' },
});
