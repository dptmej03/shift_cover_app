import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { key: 'manager', label: '👑 사장님', desc: '매장 관리 및 대타 요청' },
  { key: 'employee', label: '👤 알바생', desc: '대타 신청 및 일정 확인' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
    } catch (e) {
      Alert.alert('회원가입 실패', e.message);
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>회원가입</Text>
        </View>

        <View style={styles.form}>
          {/* 역할 선택 */}
          <Text style={styles.label}>나는 누구인가요?</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleCard, role === r.key && styles.roleCardActive]}
                onPress={() => setRole(r.key)}
              >
                <Text style={styles.roleEmoji}>{r.label}</Text>
                <Text style={[styles.roleDesc, role === r.key && styles.roleDescActive]}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>이름</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="홍길동" placeholderTextColor="#C0C0C0" />

          <Text style={styles.label}>이메일</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="example@email.com" placeholderTextColor="#C0C0C0" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="6자 이상 입력" placeholderTextColor="#C0C0C0" secureTextEntry />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>가입하기</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>이미 계정이 있으신가요? <Text style={styles.linkBold}>로그인</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  inner: { flexGrow: 1, padding: 28, paddingTop: 60 },
  header: { marginBottom: 28 },
  back: { color: '#FF7043', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#212121' },
  form: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  label: { fontSize: 13, fontWeight: '600', color: '#757575', marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 15, color: '#212121' },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: { flex: 1, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', padding: 14, alignItems: 'center', backgroundColor: '#FAFAFA' },
  roleCardActive: { borderColor: '#FF7043', backgroundColor: '#FFF3EF' },
  roleEmoji: { fontSize: 14, fontWeight: '700', color: '#212121', marginBottom: 4 },
  roleDesc: { fontSize: 11, color: '#9E9E9E', textAlign: 'center' },
  roleDescActive: { color: '#FF7043' },
  button: { backgroundColor: '#FF7043', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#9E9E9E', fontSize: 13 },
  linkBold: { color: '#FF7043', fontWeight: '700' },
});
