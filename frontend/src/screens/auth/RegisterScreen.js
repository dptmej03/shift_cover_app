import React, { useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const COLORS = { orange: '#FF7043', bg: '#FFF8F0', card: '#fff', gray: '#9E9E9E' };

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 사장님 전용
  const [storeName, setStoreName] = useState('');
  // 알바생 전용
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!role) return Alert.alert('오류', '역할을 선택해주세요.');
    if (!name || !email || !password) return Alert.alert('오류', '이름, 이메일, 비밀번호를 입력해주세요.');
    if (role === 'manager' && !storeName) return Alert.alert('오류', '매장명을 입력해주세요. (예: 스타벅스 강남점)');
    if (role === 'employee' && !inviteCode) return Alert.alert('오류', '초대 코드를 입력해주세요.');

    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'manager') payload.store_name = storeName;
      if (role === 'employee') payload.invite_code = inviteCode.toUpperCase();
      await register(payload);
    } catch (e) {
      Alert.alert('가입 실패', e.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.logo}>☕</Text>
        <Text style={styles.title}>Daeta 회원가입</Text>
        <Text style={styles.sub}>시작하기 전에 역할을 선택해주세요</Text>
      </View>

      {/* 역할 선택 */}
      <View style={styles.roleRow}>
        {[
          { key: 'manager', icon: '🏠', label: '사장님', desc: '매장 운영 & 대타 관리' },
          { key: 'employee', icon: '👋', label: '알바생', desc: '대타 신청 & 일정 확인' },
        ].map(r => (
          <TouchableOpacity
            key={r.key}
            style={[styles.roleCard, role === r.key && styles.roleCardSelected]}
            onPress={() => setRole(r.key)}
          >
            <Text style={styles.roleIcon}>{r.icon}</Text>
            <Text style={[styles.roleLabel, role === r.key && { color: COLORS.orange }]}>{r.label}</Text>
            <Text style={styles.roleDesc}>{r.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 공통 입력 */}
      <View style={styles.form}>
        <Text style={styles.label}>이름</Text>
        <TextInput style={styles.input} placeholder="홍길동" value={name} onChangeText={setName} />

        <Text style={styles.label}>이메일</Text>
        <TextInput style={styles.input} placeholder="example@email.com" keyboardType="email-address"
          autoCapitalize="none" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput style={styles.input} placeholder="비밀번호 (6자 이상)" secureTextEntry value={password}
          onChangeText={setPassword} />

        {/* 사장님 전용 */}
        {role === 'manager' && (
          <>
            <Text style={styles.label}>매장명</Text>
            <TextInput style={styles.input} placeholder="예: 스타벅스 강남점"
              value={storeName} onChangeText={setStoreName} />
            <Text style={styles.hint}>💡 입력하시면 초대 코드가 자동으로 생성됩니다!</Text>
          </>
        )}

        {/* 알바생 전용 */}
        {role === 'employee' && (
          <>
            <Text style={styles.label}>초대 코드</Text>
            <TextInput style={[styles.input, { letterSpacing: 4, textTransform: 'uppercase' }]}
              placeholder="XXXXXX" autoCapitalize="characters"
              value={inviteCode} onChangeText={setInviteCode} maxLength={6} />
            <Text style={styles.hint}>💡 사장님께 초대 코드를 받아 입력해주세요.</Text>
          </>
        )}
      </View>

      <TouchableOpacity style={[styles.btn, !role && { opacity: 0.4 }]} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>가입하기 🎉</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>이미 계정이 있나요? <Text style={{ color: COLORS.orange }}>로그인</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  logo: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#212121' },
  sub: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  roleRow: { flexDirection: 'row', marginHorizontal: 20, gap: 12, marginBottom: 8 },
  roleCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  roleCardSelected: { borderColor: COLORS.orange, backgroundColor: '#FFF3EF' },
  roleIcon: { fontSize: 28, marginBottom: 4 },
  roleLabel: { fontSize: 15, fontWeight: '700', color: '#212121', marginBottom: 2 },
  roleDesc: { fontSize: 11, color: COLORS.gray, textAlign: 'center' },
  form: { marginHorizontal: 20, marginTop: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, fontSize: 15, color: '#212121', elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  hint: { fontSize: 12, color: COLORS.orange, marginTop: 6 },
  btn: { marginHorizontal: 20, marginTop: 28, backgroundColor: COLORS.orange, borderRadius: 16, padding: 18, alignItems: 'center', elevation: 4, shadowColor: COLORS.orange, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  loginLink: { textAlign: 'center', marginTop: 20, fontSize: 14, color: COLORS.gray },
});
