import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ---------- THEME ----------
const COLORS = {
  bg: '#0B0F1A',
  card: '#151B2B',
  cardAlt: '#1B2333',
  border: '#232B40',
  text: '#FFFFFF',
  subtext: '#8A93A6',
  blue: '#3B82F6',
  green: '#22C55E',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

// ---------- DOCUMENT TYPE CONFIG ----------
const COMMON_FIELDS = [
  { key: 'product', label: 'Product', placeholder: 'Məs: Copper Cathodes' },
  { key: 'quantity', label: 'Quantity', placeholder: 'Məs: 5,000 MT' },
  { key: 'price', label: 'Price', placeholder: 'Məs: 9,500 USD / MT' },
  { key: 'delivery', label: 'Delivery Terms', placeholder: 'Məs: CIF' },
  { key: 'destination', label: 'Destination', placeholder: 'Məs: Dubai, UAE' },
  { key: 'payment', label: 'Payment Terms', placeholder: 'Məs: At sight / TT' },
  { key: 'validUntil', label: 'Valid Until', placeholder: 'Məs: 31.12.2024' },
];

function buildGenericDoc(headerTitle, companyLine, data) {
  const today = new Date().toLocaleDateString('az-AZ');
  return `${headerTitle}
Date: ${today}

Product: ${data.product || '-'}
Quantity: ${data.quantity || '-'}
Price: ${data.price || '-'}
Delivery Terms: ${data.delivery || '-'}
Destination: ${data.destination || '-'}
Payment Terms: ${data.payment || '-'}
Valid Until: ${data.validUntil || '-'}

Dear Sir/Madam,

${companyLine}

We look forward to your positive response.

Best Regards,
TradeMate Trading LLC`;
}

const DOC_TYPES = {
  loi: {
    title: 'LOI',
    formTitle: 'LOI Generator',
    fields: COMMON_FIELDS,
    build: (data) => buildGenericDoc(
      'LETTER OF INTENT',
      'We, TradeMate Trading LLC, hereby express our intent to purchase the goods described below, subject to mutually agreed terms and conditions.',
      data
    ),
  },
  icpo: {
    title: 'ICPO',
    formTitle: 'ICPO Generator',
    fields: COMMON_FIELDS,
    build: (data) => buildGenericDoc(
      'IRREVOCABLE CORPORATE PURCHASE ORDER',
      'We, TradeMate Trading LLC, hereby issue this Irrevocable Corporate Purchase Order for the supply of the following goods on the terms and conditions stated below.',
      data
    ),
  },
  fco: {
    title: 'FCO',
    formTitle: 'FCO Generator',
    fields: COMMON_FIELDS,
    build: (data) => buildGenericDoc(
      'FULL CORPORATE OFFER',
      'We, TradeMate Trading LLC, are pleased to submit our Full Corporate Offer for the supply of the following goods on the terms and conditions stated below.',
      data
    ),
  },
  offer: {
    title: 'Commercial Offer',
    formTitle: 'Commercial Offer Generator',
    fields: COMMON_FIELDS,
    build: (data) => buildGenericDoc(
      'COMMERCIAL OFFER',
      'We, TradeMate Trading LLC, are pleased to submit our Commercial Offer for the supply of the following goods on the terms and conditions stated below.',
      data
    ),
  },
  po: {
    title: 'Purchase Order',
    formTitle: 'Purchase Order Generator',
    fields: COMMON_FIELDS,
    build: (data) => buildGenericDoc(
      'PURCHASE ORDER',
      'We, TradeMate Trading LLC, hereby place this Purchase Order for the supply of the following goods on the terms and conditions stated below.',
      data
    ),
  },
  contract: {
    title: 'Business Contract',
    formTitle: 'Business Contract Generator',
    fields: COMMON_FIELDS,
    build: (data) => buildGenericDoc(
      'BUSINESS CONTRACT AGREEMENT',
      'This Business Contract Agreement is entered into between TradeMate Trading LLC and the counterparty for the supply of the following goods on the terms and conditions stated below.',
      data
    ),
  },
};

};

// ---------- EMAIL TYPE CONFIG ----------
const EMAIL_FIELDS = [
  { key: 'recipientCompany', label: 'Alıcı şirkət', placeholder: 'Məs: ABC Trading LLC' },
  { key: 'product', label: 'Mövzu / Məhsul', placeholder: 'Məs: Copper Cathodes' },
  { key: 'details', label: 'Əlavə detallar', placeholder: 'Məs: 5,000 MT, CIF Dubai, 9,500 USD/MT' },
  { key: 'senderName', label: 'Sizin adınız', placeholder: 'Məs: Terlan Amirkhanov' },
];

function buildEmail(subjectLine, bodyIntro, data) {
  return `Subject: ${subjectLine}${data.product ? ' — ' + data.product : ''}

Dear ${data.recipientCompany || 'Sir/Madam'},

${bodyIntro}

${data.details || ''}

Best regards,
${data.senderName || 'TradeMate Trading LLC'}`;
}

const EMAIL_TYPES = {
  newOffer: {
    title: 'New Offer',
    formTitle: 'New Offer Email',
    icon: '📤',
    fields: EMAIL_FIELDS,
    build: (data) => buildEmail(
      'New Offer',
      'We are pleased to present you with a new offer that we believe will be of great interest to your company.',
      data
    ),
  },
  followUp: {
    title: 'Follow-up',
    formTitle: 'Follow-up Email',
    icon: '📧',
    fields: EMAIL_FIELDS,
    build: (data) => buildEmail(
      'Following Up',
      'I am writing to follow up on our previous correspondence and check on the current status.',
      data
    ),
  },
  negotiation: {
    title: 'Negotiation',
    formTitle: 'Negotiation Email',
    icon: '🤝',
    fields: EMAIL_FIELDS,
    build: (data) => buildEmail(
      'Regarding Terms',
      'Thank you for your proposal. We would like to discuss the terms further to reach a mutually beneficial agreement.',
      data
    ),
  },
  complaint: {
    title: 'Complaint',
    formTitle: 'Complaint Email',
    icon: '⚠️',
    fields: EMAIL_FIELDS,
    build: (data) => buildEmail(
      'Regarding an Issue',
      'We regret to inform you that we have encountered an issue that requires your urgent attention.',
      data
    ),
  },
  meetingRequest: {
    title: 'Meeting Request',
    formTitle: 'Meeting Request Email',
    icon: '📅',
    fields: EMAIL_FIELDS,
    build: (data) => buildEmail(
      'Meeting Request',
      'We would like to schedule a meeting to discuss this matter in more detail at your earliest convenience.',
      data
    ),
  },
};

// ---------- HOME SCREEN ----------
function HomeScreen({ onNavigate }) {
  const tiles = [
    { key: 'assistant', title: 'AI Assistant', desc: 'AI ilə danış və suallarına cavab al', color: COLORS.blue, icon: '🤖' },
    { key: 'createDoc', title: 'Create Document', desc: 'LOI, FCO, Offer və digər sənədləri yarat', color: COLORS.green, icon: '📄' },
    { key: 'email', title: 'Business Email', desc: 'Peşəkar e-poçtlar hazırla', color: '#F59E0B', icon: '✉️' },
    { key: 'translate', title: 'Translate', desc: 'Mətnləri istənilən dilə tərcümə et', color: COLORS.purple, icon: 'A文' },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.h1}>Xoş gəldiniz! 👋</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>👑 Pro</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>TradeMate AI ilə işinizi daha asan və sürətli idarə edin.</Text>

      <View style={styles.grid}>
        {tiles.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tile, { backgroundColor: COLORS.card }]}
            onPress={() => onNavigate(t.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.tileIcon, { backgroundColor: t.color + '22' }]}>
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
            </View>
            <Text style={styles.tileTitle}>{t.title}</Text>
            <Text style={styles.tileDesc}>{t.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.wideCard} activeOpacity={0.7} onPress={() => {}}>
        <View style={[styles.tileIcon, { backgroundColor: '#EF444422' }]}>
          <Text style={{ fontSize: 20 }}>📕</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.tileTitle}>Analyze PDF</Text>
          <Text style={styles.tileDesc}>PDF fayllarını oxuyun, xülasə çıxarın və analiz edin</Text>
        </View>
        <Text style={{ color: COLORS.subtext, fontSize: 18 }}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------- CREATE DOCUMENT (LIST) ----------
function CreateDocumentScreen({ onSelectDoc, onBack }) {
  const docs = [
    { key: 'loi', desc: 'Letter of Intent' },
    { key: 'icpo', desc: 'Irrevocable Corporate Purchase Order' },
    { key: 'fco', desc: 'Full Corporate Offer' },
    { key: 'offer', desc: 'Sales Offer' },
    { key: 'po', desc: 'Purchase Order' },
    { key: 'contract', desc: 'Contract Agreement' },
  ];
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Header title="Create Document" onBack={onBack} />
      <Text style={styles.sectionLabel}>Sənəd növünü seçin</Text>
      {docs.map((d) => (
        <TouchableOpacity
          key={d.key}
          style={styles.listRow}
          activeOpacity={0.7}
          onPress={() => onSelectDoc(d.key)}
        >
          <Text style={styles.listTitle}>{DOC_TYPES[d.key].title}</Text>
          <Text style={styles.listDesc}>{d.desc}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ---------- GENERIC DOCUMENT FORM ----------
function DocFormScreen({ docKey, onGenerate, onBack }) {
  const docType = DOC_TYPES[docKey];
  const [form, setForm] = useState({
    product: '', quantity: '', price: '', delivery: '', destination: '', payment: '', validUntil: '',
  });
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
      <Header title={docType.formTitle} onBack={onBack} />
      <Text style={styles.sectionLabel}>Məlumatları daxil edin</Text>
      {docType.fields.map((f) => (
        <View key={f.key} style={{ marginBottom: 14 }}>
          <Text style={styles.inputLabel}>{f.label}</Text>
          <TextInput
            style={styles.input}
            placeholder={f.placeholder}
            placeholderTextColor={COLORS.subtext}
            value={form[f.key]}
            onChangeText={set(f.key)}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.primaryButton} onPress={() => onGenerate(docType.build(form))}>
        <Text style={styles.primaryButtonText}>✨ Sənədi yarat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------- PDF EXPORT ----------
async function exportToPdf(text) {
  const safeHtml = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const html = `
    <html>
      <body style="font-family: -apple-system, sans-serif; padding: 24px; font-size: 14px; line-height: 1.6; color: #111;">
        ${safeHtml}
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Sənədi paylaş / saxla' });
    } else {
      Alert.alert('PDF hazırdır', 'Fayl yaradıldı: ' + uri);
    }
  } catch (err) {
    Alert.alert('Xəta', 'PDF yaradılarkən problem baş verdi: ' + err.message);
  }
}

// ---------- DOCUMENT PREVIEW ----------
function DocumentPreviewScreen({ text, onBack, onTextChange }) {
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportToPdf(text);
    setExporting(false);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
      <Header title="Document Preview" onBack={onBack} />
      <View style={styles.previewBox}>
        {editing ? (
          <TextInput
            style={styles.previewEditInput}
            value={text}
            onChangeText={onTextChange}
            multiline
            textAlignVertical="top"
          />
        ) : (
          <Text style={styles.previewText}>{text}</Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity
          style={[styles.secondaryButton, { flex: 1, marginRight: 8 }]}
          onPress={() => setEditing(!editing)}
        >
          <Text style={styles.secondaryButtonText}>{editing ? '✅ Hazırdır' : '✏️ Redaktə et'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, { flex: 1, marginLeft: 8 }]}
          onPress={handleExport}
          disabled={exporting}
        >
          <Text style={styles.primaryButtonText}>{exporting ? '⏳ Hazırlanır...' : '⬇️ PDF Yüklə'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------- BUSINESS EMAIL (LIST) ----------
function EmailListScreen({ onSelectEmail, onBack }) {
  const keys = Object.keys(EMAIL_TYPES);
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Header title="Business Email" onBack={onBack} />
      <Text style={styles.sectionLabel}>E-mail növünü seçin</Text>
      {keys.map((k) => (
        <TouchableOpacity
          key={k}
          style={styles.emailRow}
          activeOpacity={0.7}
          onPress={() => onSelectEmail(k)}
        >
          <View style={styles.emailIconWrap}>
            <Text style={{ fontSize: 18 }}>{EMAIL_TYPES[k].icon}</Text>
          </View>
          <Text style={styles.listTitle}>{EMAIL_TYPES[k].title}</Text>
          <Text style={{ color: COLORS.subtext, fontSize: 16, marginLeft: 'auto' }}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ---------- EMAIL FORM ----------
function EmailFormScreen({ emailKey, onGenerate, onBack }) {
  const emailType = EMAIL_TYPES[emailKey];
  const [form, setForm] = useState({ recipientCompany: '', product: '', details: '', senderName: '' });
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
      <Header title={emailType.formTitle} onBack={onBack} />
      <Text style={styles.sectionLabel}>Məlumatları daxil edin</Text>
      {emailType.fields.map((f) => (
        <View key={f.key} style={{ marginBottom: 14 }}>
          <Text style={styles.inputLabel}>{f.label}</Text>
          <TextInput
            style={styles.input}
            placeholder={f.placeholder}
            placeholderTextColor={COLORS.subtext}
            value={form[f.key]}
            onChangeText={set(f.key)}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.primaryButton} onPress={() => onGenerate(emailType.build(form))}>
        <Text style={styles.primaryButtonText}>✨ E-maili yarat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------- SHARED HEADER ----------
function Header({ title, onBack }) {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
        <Text style={{ color: COLORS.text, fontSize: 20 }}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

// ---------- ROOT APP ----------
export default function App() {
  const [screen, setScreen] = useState('home');
  const [docText, setDocText] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('loi');
  const [selectedEmail, setSelectedEmail] = useState('newOffer');

  const goHome = () => setScreen('home');

  const handleSelectDoc = (docKey) => {
    setSelectedDoc(docKey);
    setScreen('docForm');
  };

  const handleSelectEmail = (emailKey) => {
    setSelectedEmail(emailKey);
    setScreen('emailForm');
  };

  const handleGenerate = (text) => {
    setDocText(text);
    setScreen('preview');
  };

  let content;
  if (screen === 'home') {
    content = <HomeScreen onNavigate={(key) => setScreen(['createDoc', 'email'].includes(key) ? key : 'home')} />;
  } else if (screen === 'createDoc') {
    content = <CreateDocumentScreen onSelectDoc={handleSelectDoc} onBack={goHome} />;
  } else if (screen === 'docForm') {
    content = <DocFormScreen docKey={selectedDoc} onGenerate={handleGenerate} onBack={() => setScreen('createDoc')} />;
  } else if (screen === 'email') {
    content = <EmailListScreen onSelectEmail={handleSelectEmail} onBack={goHome} />;
  } else if (screen === 'emailForm') {
    content = <EmailFormScreen emailKey={selectedEmail} onGenerate={handleGenerate} onBack={() => setScreen('email')} />;
  } else if (screen === 'preview') {
    content = <DocumentPreviewScreen text={docText} onTextChange={setDocText} onBack={goHome} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      {content}
      <View style={styles.tabBar}>
        <TabItem label="Home" icon="🏠" active={screen === 'home'} onPress={goHome} />
        <TabItem label="History" icon="🕐" active={false} onPress={() => {}} />
        <TabItem label="Favorites" icon="⭐" active={false} onPress={() => {}} />
        <TabItem label="Profile" icon="👤" active={false} onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

function TabItem({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Text style={{ fontSize: 18, opacity: active ? 1 : 0.5 }}>{icon}</Text>
      <Text style={[styles.tabLabel, { color: active ? COLORS.blue : COLORS.subtext }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  h1: { color: COLORS.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: COLORS.subtext, fontSize: 14, marginTop: 6, marginBottom: 20 },
  proBadge: { backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  proBadgeText: { color: '#FBBF24', fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tileIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  tileTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  tileDesc: { color: COLORS.subtext, fontSize: 12, lineHeight: 16 },
  wideCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '600' },
  sectionLabel: { color: COLORS.subtext, fontSize: 13, marginBottom: 12 },
  listRow: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  listTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  listDesc: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },
  emailRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  emailIconWrap: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.cardAlt,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  inputLabel: { color: COLORS.subtext, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.card, borderRadius: 10, padding: 12,
    color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, fontSize: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.blue, borderRadius: 12, padding: 15,
    alignItems: 'center', marginTop: 8,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryButton: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 15,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  secondaryButtonText: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
  previewBox: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18, minHeight: 300,
  },
  previewText: { color: '#111', fontSize: 13, lineHeight: 20 },
  previewEditInput: { color: '#111', fontSize: 13, lineHeight: 20, minHeight: 280, padding: 0 },
  tabBar: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingVertical: 10, backgroundColor: COLORS.bg,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 11, marginTop: 3 },
});
