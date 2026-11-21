import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';
import { useEffect, useState } from 'react';
import {
  BackHandler, Image, Modal, Platform, Pressable, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, View, useWindowDimensions,
} from 'react-native';

const rooms = [
  { title: 'Ayesha ka Room', people: 12, gifts: 3, faces: [13, 3, 0] },
  { title: 'Family Party', people: 24, gifts: 8, faces: [14, 5, 15] },
  { title: 'Bhai Squad', people: 8, gifts: 2, faces: [7, 2, 1] },
  { title: 'Dadi & Nani Chat', people: 5, gifts: 5, faces: [14, 12, 15] },
];
const gifts = [
  ['🌹', 'Rose', 10], ['💗', 'Heart', 50], ['☕', 'Chai', 100],
  ['🚗', 'Car', 1000], ['👑', 'Crown', 5000], ['🦁', 'Sher', 20000],
];
const packs = [[8000, 1, 'POPULAR'], [16000, 2], [40000, 5], [80000, 10],
  [200000, 25, 'BEST VALUE'], [400000, 50, 'MOST COINS']];
const methods = ['JazzCash', 'Easypaisa', 'Bank Card'];
const names = ['Emma', 'Mike', 'Sophie', 'Jamal', 'Sarah', 'Liam', 'Aisha'];
const avatarSheet = require('./assets/family-avatars.jpg');
const seededChat = {
  live: [['Mia', 'love this fam night!! 🔥', 1], ['Alex', 'grandma just joined 👀', 0], ['Kai', 'can we do story time next?', 11]],
  private: [['', 'Sarah joined the room 👋', 13], ['Mike', 'can everyone hear me now?', 3], ['', 'Emma sent Rose 🌹 ×10', 0]],
};
const ink = '#211735';
const purple = '#5319a4';
const peach = '#ffad77';
const cream = '#fff8f5';
const direction = {
  auth: '155deg, #48208d 0%, #692b8f 43%, #ab527e 69%, #ff955d 90%, #ffb668 100%',
  action: '135deg, #4e1aa0 5%, #763382 60%, #ffa34e 100%',
  amber: '135deg, #ffb34d, #ff8046 58%, #e95948',
  lobby: '160deg, #f8eef7, #ecdaf0 66%, #dfc5ee',
  card: '145deg, #621ab8 5%, #883f9e 40%, #df7457 63%, #5914ac 100%',
  cardWarm: '145deg, #fc8b43 5%, #db6b64 27%, #7e2d9d 61%, #5515a9 100%',
  live: '145deg, #25143e 14%, #371d58 45%, #562a52 69%, #170a34 91%',
  private: '150deg, #17122b 5%, #32177a 41%, #422483 72%, #211335 97%',
  glass: '145deg, #483759, #564060 55%, #9b5c5e',
  coins: '148deg, #6645bc 20%, #7953cb 46%, #e6968a 69%, #c2a2ed 83%',
};
function gradient(name) {
  const key = Platform.OS === 'web' ? 'backgroundImage' : 'experimental_backgroundImage';
  return { [key]: 'linear-gradient(' + direction[name] + ')' };
}
function Label({ children, size = 15, color = ink, bold = false, style }) {
  return <Text style={[{ fontSize: size, color, fontWeight: bold ? '700' : '400' }, style]}>{children}</Text>;
}
function Button({ children, onPress, style, label, selected, disabled = false }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
    accessibilityState={{ disabled, selected }} onPress={onPress}
    style={({ pressed }) => [style, pressed && { opacity: 0.78 }]}>{children}</Pressable>;
}
function Avatar({ face, size }) {
  const tile = face % 16;
  const scale = size / 0.91;
  const inset = (scale - size) / 2;
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
    <Image source={avatarSheet} fadeDuration={0} resizeMode="stretch"
      style={{ position: 'absolute', width: scale * 4, height: scale * 4,
        left: -(tile % 4) * scale - inset, top: -Math.floor(tile / 4) * scale - inset }} />
  </View>;
}

function App() {
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 560);
  const [screen, setScreen] = useState('auth');
  const [previous, setPrevious] = useState('home');
  const [authStep, setAuthStep] = useState('login');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [roomList, setRoomList] = useState(rooms);
  const [room, setRoom] = useState(rooms[0]);
  const [roomName, setRoomName] = useState('');
  const [modal, setModal] = useState(null);
  const [messages, setMessages] = useState({});
  const [draft, setDraft] = useState('');
  const [gift, setGift] = useState(null);
  const [muted, setMuted] = useState({});
  const [seated, setSeated] = useState(false);
  const [coins, setCoins] = useState(0);
  const [payment, setPayment] = useState('');
  const [pack, setPack] = useState(null);
  const [tab, setTab] = useState('Home');

  const darkRoom = screen === 'live' || screen === 'private';
  const chatKey = screen + ':' + room.title;
  const chat = messages[chatKey] || seededChat[screen] || [];
  const goBack = () => {
    if (modal) setModal(null);
    else if (screen === 'coins') setScreen(previous);
    else if (darkRoom) setScreen('home');
    else if (screen === 'auth' && authStep !== 'login') setAuthStep('login');
    else return false;
    return true;
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => subscription.remove();
  }, [screen, previous, modal, authStep]);

  function signIn() {
    setModal(null);
    setAuthStep('login');
    setError('');
    setScreen('home');
  }
  function enter(item) {
    setRoom(item);
    setGift(null);
    setDraft('');
    setMuted({});
    setSeated(false);
    setScreen(item.private ? 'private' : 'live');
  }
  function openCoins() {
    setPrevious(screen);
    setScreen('coins');
    setModal(null);
  }
  function addMessage(name, message) {
    setMessages(current => ({
      ...current, [chatKey]: [...(current[chatKey] || seededChat[screen] || []), [name, message, 2]],
    }));
  }
  function sendMessage() {
    if (!draft.trim()) return;
    addMessage('You', draft.trim());
    setDraft('');
  }
  function sendGift() {
    if (!gift) return;
    if (coins < gift[2]) {
      setModal('balance');
      return;
    }
    setCoins(coins - gift[2]);
    addMessage('', 'You sent ' + gift[1] + ' ' + gift[0]);
    setGift(null);
  }

  function auth() {
    return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.authContent}>
      <Label size={68} style={styles.center}>🦉</Label>
      <Label color="white" size={Math.min(pageWidth * 0.09, 42)} bold style={styles.center}>Family Voice Chat</Label>
      <Label color="white" size={14} style={[styles.center, { marginTop: 6 }]}>Stay connected with your family, anytime</Label>
      <View style={styles.authCard}>
        <Label size={24} bold style={styles.center}>{authStep === 'login' ? 'Welcome Back!' : authStep === 'signup' ? 'Create account' : 'Verify your number'}</Label>
        <Label style={[styles.center, { marginTop: 5 }]}>{authStep === 'login' ? 'Log in to continue' : authStep === 'otp' ? 'Enter demo code 123456' : 'Join Family Voice Chat'}</Label>
        <Label style={{ marginTop: 28, marginBottom: 10 }} bold>{authStep === 'otp' ? 'Verification code' : 'Phone Number'}</Label>
        <View style={styles.inputRow}>
          <Label size={21}>{authStep === 'otp' ? '♙' : '☎'}</Label>
          <TextInput accessibilityLabel={authStep === 'otp' ? 'Verification code' : 'Phone number'}
            keyboardType={authStep === 'otp' ? 'number-pad' : 'phone-pad'}
            placeholder={authStep === 'otp' ? '123456' : '+1 (555) 123-4567'} placeholderTextColor="#716778"
            value={authStep === 'otp' ? code : phone} maxLength={authStep === 'otp' ? 6 : 24}
            onChangeText={value => { setError(''); if (authStep === 'otp') setCode(value); else setPhone(value); }}
            style={styles.input} />
        </View>
        {error ? <Label color="#a52743" style={{ marginTop: 8 }}>{error}</Label> : null}
        <Button style={[styles.loginButton, gradient('action')]} onPress={() => {
          if (authStep === 'otp') {
            if (code === '123456') signIn(); else setError('Enter the demo code 123456.');
          } else if (phone.replace(/\D/g, '').length >= 7) {
            setCode(''); setAuthStep('otp'); setError('');
          } else setError('Enter your phone number to continue.');
        }}><Label color="white" size={24}>⛨</Label><Label size={17} bold color="white" style={{ flex: 1 }}>
          {authStep === 'otp' ? 'Verify and continue' : authStep === 'signup' ? 'Create account with OTP' : 'Login with Phone Number with OTP'}
        </Label></Button>
        <Label color="#897682" style={[styles.center, { marginVertical: 17 }]}>─ or ─</Label>
        <Button style={styles.google} onPress={() => setModal('gmail')}>
          <Label color="#4285f4" size={30} bold>G</Label><Label size={17}>Login with Gmail</Label>
        </Button>
        <Label size={11} style={[styles.center, { marginTop: 23 }]}>By continuing, you agree to our</Label>
        <Button onPress={() => setModal('terms')}><Label size={11} style={styles.center}>Terms of Service &amp; Privacy Policy</Label></Button>
      </View>
      <Button style={{ marginTop: 14 }} onPress={() => { setAuthStep(authStep === 'login' ? 'signup' : 'login'); setError(''); }}>
        <Label color="#482064" size={12} bold style={styles.center}>{authStep === 'login' ? 'New to Family Voice Chat?  Create account' : 'Back to login'}</Label>
      </Button>
    </ScrollView>;
  }

  function home() {
    const shown = roomList.filter(item => (filter === 'all' || Boolean(item.private) === (filter === 'private')) && item.title.toLowerCase().includes(query.trim().toLowerCase()));
    const cardWidth = (pageWidth - 49) / 2;
    return <>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.homeContent}>
        <View style={styles.between}>
          <Label size={Math.min(pageWidth * 0.07, 36)} bold color={purple} style={{ flex: 1 }}>Family Voice Chat</Label>
          <Button style={styles.coinPill} onPress={openCoins}><Label size={13} bold>🪙 {coins.toLocaleString()} coins</Label></Button>
        </View>
        <View style={styles.search}>
          <Label size={24} color={purple}>⌕</Label>
          <TextInput accessibilityLabel="Search rooms" placeholder="Search rooms, families..." placeholderTextColor="#826c86"
            value={query} onChangeText={setQuery} style={[styles.input, { textAlign: 'right' }]} />
          <Button label="Filter rooms" onPress={() => setModal('filters')}><Label size={23}>☷</Label></Button>
        </View>
        <View style={[styles.between, { marginBottom: 16 }]}>
          <Label size={23} bold>{tab === 'Rooms' ? 'Voice Rooms' : 'Live Voice Rooms'}</Label>
          <Button onPress={() => { setFilter('all'); setQuery(''); setTab('Rooms'); }}><Label bold color="#b95935">See all →</Label></Button>
        </View>
        <View style={styles.cards}>
          {shown.map((item, index) => <Button key={item.title} onPress={() => enter(item)}
            style={[styles.roomCard, gradient(index === 0 ? 'card' : 'cardWarm'), { width: cardWidth, minHeight: cardWidth * 1.42 }]}>
            <Label size={10} bold color="#b74841" style={styles.liveTag}>{item.private ? '♙ PRIVATE' : '● LIVE'}</Label>
            <View style={[styles.cluster, { height: cardWidth * 0.74 }]}>
              {item.faces.map((face, i) => <View key={i} style={{ position: 'absolute', left: [0.27, 0.01, 0.53][i] * cardWidth, top: [0, 0.15, 0.24][i] * cardWidth }}>
                <Avatar size={cardWidth * [0.47, 0.41, 0.42][i]} face={face} />
              </View>)}
            </View>
            <Label color="white" size={Math.min(cardWidth * 0.12, 25)} bold style={styles.center}>{item.title}</Label>
            <Label size={13} color="white" bold style={[styles.center, { marginTop: 12 }]}>♟ {item.people} live   🎁 {item.gifts} gifts</Label>
          </Button>)}
        </View>
        {shown.length === 0 && <Label style={styles.center}>No rooms found.</Label>}
      </ScrollView>
      <View style={styles.tabbar}>
        {[['⌂', 'Home'], ['▤', 'Rooms'], ['+', 'Create'], ['🎁', 'Gifts'], ['●', 'Profile']].map(([icon, name]) =>
          <Button key={name} selected={tab === name} style={[styles.tab, name === 'Create' && styles.createTab,
            name === 'Create' ? gradient('amber') : tab === name && gradient('action')]} onPress={() => {
            if (name === 'Gifts') openCoins();
            else if (name === 'Create') { setError(''); setRoomName(''); setModal('create'); }
            else if (name === 'Profile') setModal('profile');
            else setTab(name);
          }}><Label size={name === 'Create' ? 32 : 23} bold color={tab === name ? peach : ink}>{icon}</Label>
            <Label size={12} bold color={tab === name ? peach : ink}>{name}</Label></Button>)}
      </View>
    </>;
  }

  function seats() {
    const size = Math.min(pageWidth * 0.18, 85);
    const toggle = i => setMuted(current => ({ ...current, [i]: !current[i] }));
    if (screen === 'live') return <View style={styles.seatGrid}>
      {Array.from({ length: 20 }, (_, i) => <Button key={i} label={'Toggle microphone for seat ' + (i + 1)} onPress={() => toggle(i)}
        style={[styles.seat, gradient('glass'), { width: (pageWidth - 66) / 5 }, i === 0 && { borderColor: peach }]}>
        {i === 0 && <Label size={8} color="#ffe7af" bold style={styles.hostBadge}>👑 HOST</Label>}
        <Avatar face={i} size={size * 0.62} /><Label color="white" bold>{i + 1}</Label>
        <Label size={13} color={peach}>{muted[i] ? '⊘' : '♩'}</Label>
      </Button>)}
    </View>;
    const stage = pageWidth - 30;
    const positions = [[50, 0], [79, 13], [91, 41], [79, 68], [21, 13], [9, 41], [21, 68]];
    const stageHeight = stage * 1.15;
    return <View style={{ height: stageHeight, marginVertical: 14 }}>
      <View style={[styles.ring, { top: stage * 0.08, width: stage * 0.92, height: stage * 0.92, borderRadius: stage / 2 }]} />
      {names.map((name, i) => <Button key={name} label={'Toggle microphone for ' + name}
        style={[styles.member, { left: stage * positions[i][0] / 100 - size * 0.55, top: stageHeight * positions[i][1] / 100, width: size * 1.1 }]}
        onPress={() => toggle(i)}><Avatar face={[0, 1, 2, 3, 4, 5, 13][i]} size={size} /><Label color="white" bold size={12}>{name}</Label>
        <Label size={12} color="white" style={[styles.mic, { backgroundColor: Boolean(muted[i]) !== (i === 2 || i === 5) ? '#716981' : '#29b993' }]}>♩</Label>
      </Button>)}
      <Button label="Toggle host microphone" style={[styles.member, { left: stage / 2 - size * 0.68, top: stageHeight * 0.36, width: size * 1.36 }]} onPress={() => toggle(7)}>
        <Label size={22}>👑</Label><Avatar face={11} size={size * 1.21} />
        <Label color="white" bold size={17}>Host</Label><Label color={peach} bold size={11}>{muted[7] ? 'Muted' : '♛ Host'}</Label>
      </Button>
      <Button style={[styles.openSeat, { left: stage / 2 - size * 0.43, bottom: 0, width: size * 0.86, height: size * 0.86 }]}
        onPress={() => { setSeated(!seated); addMessage('', seated ? 'You left Seat 5' : 'You joined Seat 5'); }}>
        <Label color="white" bold size={22}>{seated ? '✓' : '+'}</Label><Label color="#e7cdd8" size={11}>Seat 5</Label>
      </Button>
    </View>;
  }

  function voice() {
    return <><View style={[styles.between, styles.roomHeader]}>
      <Button label="Back" onPress={goBack}><Label color="white" size={28}>‹</Label></Button>
      <Label color="white" bold size={Math.min(pageWidth * 0.047, 24)}>Family Voice Chat</Label>
      <Label color="#e6cbee" size={10}>{screen === 'live' ? '● LIVE  127 viewers' : '● 1.2k online'}</Label>
      {screen === 'live' && <Button label="Share room" onPress={() => setModal('share')}><Label color="white" size={19}>⇧</Label></Button>}
      <Button label="Room options" onPress={() => setModal('room')}><Label color="white" size={20}>⋯</Label></Button>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 8 }}>
      <View style={styles.roomMeta}>
        <Label color="#e7bad4" size={12}>{screen === 'live' ? '♟ Room ID: 882901' : '♙ Private • Room ID: 847392'}</Label>
        <Button onPress={() => setModal('rewards')}><Label color={peach} size={12}>{screen === 'live' ? '🎁 Top Gifts: 1.2K' : '🎁 Rewards'}</Label></Button>
      </View>
      {seats()}
      <View style={[styles.chat, gradient('glass')]}>
        {screen === 'live' && <Label color="white" bold size={18}>Chat  <Label color={peach} size={13}>{128 + chat.length - 3} messages</Label></Label>}
        {chat.slice(-3).map(([name, message, face], i) => <View key={i} style={styles.chatRow}>
          <Avatar face={face} size={28} /><View style={{ flex: 1 }}>
            {name ? <Label color="white" bold size={11}>{name}</Label> : null}
            <Label color="#fff1f8" size={12}>{message}</Label>
          </View>{screen === 'live' && <Label color="#e1c9de" size={10}>{i === 0 ? 'now' : i + 'm'}</Label>}
        </View>)}
      </View>
      <View style={styles.giftStrip}>
        {gifts.map(item => <Button key={item[1]} label={item[1] + ', ' + item[2] + ' coins'} selected={gift === item}
          style={[styles.giftTile, gift === item && { borderColor: peach, backgroundColor: '#63375e' }]} onPress={() => setGift(item)}>
          <Label size={22}>{item[0]}</Label><Label size={9} bold color={peach}>{item[1]}</Label>
          {screen === 'private' && <Label size={7} color="#ffdfb3" style={styles.center}>{item[2]} coins</Label>}
        </Button>)}
      </View>
    </ScrollView>
    <View style={styles.composer}>
      <Button label="Add emoji" onPress={() => setDraft(draft + ' 😊')}><Label color="#e7c6d5" size={22}>☺</Label></Button>
      <TextInput accessibilityLabel="Chat message" style={[styles.input, { color: 'white' }]} placeholder="Say something..."
        placeholderTextColor="#d6b9cb" value={draft} onChangeText={setDraft} onSubmitEditing={sendMessage} returnKeyType="send" />
      <Button style={[styles.send, gradient('amber')]} onPress={draft.trim() ? sendMessage : sendGift}>
        <Label color="white" size={13} bold>{gift && !draft.trim() ? '🎁 Send' : '➤ Send'}</Label>
      </Button>
    </View></>;
  }

  function coinStore() {
    return <ScrollView contentContainerStyle={styles.store}>
      <View style={styles.between}><Button label="Back" onPress={goBack}><Label color="white" size={29}>←</Label></Button>
        <Label color="white" size={34} bold>Buy Coins</Label><Button label="Payment help" onPress={() => setModal('help')}><Label color="white" size={27}>ⓘ</Label></Button>
      </View>
      <View style={[styles.row, { marginVertical: 23 }]}>
        <Label color="white" size={28} style={[styles.storeIcon, gradient('action')]}>🎧</Label>
        <View style={{ flex: 1 }}><Label color="white" size={Math.min(pageWidth * 0.063, 34)} bold>Family Voice Chat</Label>
          <Label color="#f1dffa" size={11} bold>Recharge coins to send gifts &amp; unlock features</Label></View>
      </View>
      {packs.map(item => <View key={item[0]} style={styles.pack}>
        {item[2] && <Label color="white" size={9} bold style={[styles.packBadge, item[2] === 'MOST COINS' && { backgroundColor: '#5840a2' }]}>{item[2]}</Label>}
        <Label size={34}>🪙</Label>
        <View style={{ flex: 1 }}><Label size={Math.min(pageWidth * 0.051, 24)} bold>{item[0]} Coins</Label><Label size={17} bold>${item[1]}</Label></View>
        <Button label={'Buy ' + item[0] + ' coins'} style={styles.buy} onPress={() => { setPack(item); setModal('purchase'); }}><Label color="white" size={20} bold>Buy</Label></Button>
      </View>)}
      <Label size={23} bold style={[styles.center, { marginVertical: 12 }]}>Payment Methods</Label>
      <View style={styles.row}>{methods.map((method, i) =>
        <Button key={method} selected={payment === method} style={[styles.payment, payment === method && { borderColor: '#6329b7' }]} onPress={() => setPayment(method)}>
          <Label size={i === 0 ? 14 : 23} bold color={i < 2 ? '#207b5b' : ink}>{['JazzCash', 'ℯ', '▰'][i]}</Label><Label size={11}>{method}</Label>
        </Button>)}</View>
      <Label color="white" size={11} bold style={[styles.center, { marginTop: 18 }]}>Secure payments • You can manage purchases in Settings</Label>
    </ScrollView>;
  }

  const dialogs = {
    gmail: ['Login with Gmail', 'Continue with the demo account.', 'Continue', signIn],
    terms: ['Terms of Service & Privacy Policy', 'This preview uses demo interactions. Sign-in and payment services are not connected.'],
    help: ['Payment help', 'Select a coin pack and choose a payment method to try the demo checkout.'],
    profile: ['Profile', 'Demo account • ' + coins.toLocaleString() + ' coins', 'Log out', () => { setScreen('auth'); setModal(null); }],
    room: [room.title, 'Choose a room layout or return to the lobby.'],
    share: ['Share room', 'Family Voice Chat • Room ID ' + (screen === 'live' ? '882901' : '847392')],
    rewards: ['Room rewards', 'Rose, Heart, Chai, Car, Crown and Sher are available in the gift tray.'],
    filters: ['Filter rooms', 'Choose which rooms to show.'],
    balance: ['Buy Coins', 'Add demo coins to send this gift.', 'View coin packs', openCoins],
    purchase: ['Buy ' + pack?.[0] + ' Coins', 'Select a payment method for the demo purchase. No payment will be collected.'],
    create: ['Create a room', 'Give your private voice room a name.'],
  };
  const dialog = dialogs[modal];
  function createRoom() {
    const title = roomName.trim();
    if (!title || roomList.some(item => item.title.toLowerCase() === title.toLowerCase())) {
      setError(title ? 'Choose a name that is not already in use.' : 'Enter a room name.');
      return;
    }
    const item = { title, private: true, people: 1, gifts: 0, faces: [0, 1, 3] };
    setRoomList(current => [...current, item]);
    setModal(null);
    enter(item);
  }

  return <View style={styles.shell}>
    <StatusBar barStyle="light-content" backgroundColor="#211735" />
    <View style={[styles.page, { width: pageWidth }, gradient(darkRoom ? screen : { auth: 'auth', home: 'lobby', coins: 'coins' }[screen])]}>
      {screen === 'auth' ? auth() : screen === 'home' ? home() : screen === 'coins' ? coinStore() : voice()}
    </View>
    <Modal visible={Boolean(dialog)} transparent animationType="fade" onRequestClose={() => setModal(null)}>
      <View style={styles.shade}>
        {dialog && <View style={styles.dialog}>
          <View style={styles.between}><Label size={22} bold style={{ flex: 1 }}>{dialog[0]}</Label>
            <Button label="Close" onPress={() => setModal(null)}><Label size={26}>×</Label></Button></View>
          <Label style={{ marginVertical: 12 }}>{dialog[1]}</Label>
          {dialog[2] && <Button style={[styles.dialogAction, gradient('action')]} onPress={() => { setModal(null); dialog[3](); }}>
            <Label color="white" bold>{dialog[2]}</Label></Button>}
          {modal === 'filters' && ['all', 'live', 'private'].map(value => <Button key={value} selected={filter === value}
            style={styles.option} onPress={() => { setFilter(value); setModal(null); }}><Label bold>{value[0].toUpperCase() + value.slice(1)} rooms {filter === value ? '✓' : ''}</Label></Button>)}
          {modal === 'room' && <>
            <Button style={styles.option} onPress={() => { setModal(null); setScreen(screen === 'live' ? 'private' : 'live'); }}><Label bold>Switch room layout</Label></Button>
            <Button style={styles.option} onPress={() => { setModal(null); setScreen('home'); }}><Label bold>Leave room</Label></Button>
          </>}
          {modal === 'create' && <>
            <TextInput accessibilityLabel="Room name" value={roomName} onChangeText={value => { setRoomName(value); setError(''); }} maxLength={35} placeholder="Room name" placeholderTextColor="#817485" style={[styles.input, styles.option, { flex: 0 }]} />
            {error && <Label color="#a52743">{error}</Label>}
            <Button style={[styles.dialogAction, gradient('action')]} onPress={createRoom}><Label bold color="white">Create room</Label></Button>
          </>}
          {modal === 'purchase' && <>
            {methods.map(method => <Button key={method} style={styles.option} selected={payment === method} onPress={() => setPayment(method)}>
              <Label bold>{method}{payment === method ? ' ✓' : ''}</Label></Button>)}
            <Button disabled={!payment} style={[styles.dialogAction, gradient('action'), !payment && { opacity: 0.5 }]} onPress={() => {
              setCoins(value => value + pack[0]); setModal(null);
            }}><Label bold color="white">Confirm demo purchase</Label></Button>
          </>}
        </View>}
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#211735', alignItems: 'center' },
  page: { flex: 1, backgroundColor: '#513198', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0, paddingBottom: Platform.OS === 'android' ? 18 : 0 },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  authContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 27 },
  authCard: { marginTop: 26, borderRadius: 24, backgroundColor: 'rgba(255,250,248,0.95)', padding: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#d8ced5', borderRadius: 15, paddingHorizontal: 13, minHeight: 50 },
  input: { flex: 1, minWidth: 0, fontSize: 15, color: ink, paddingVertical: 8 },
  loginButton: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: purple, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 19, marginTop: 17, elevation: 4 },
  google: { flexDirection: 'row', gap: 13, alignItems: 'center', borderWidth: 1.5, borderColor: '#7e3b92', borderRadius: 19, minHeight: 55, paddingHorizontal: 15 },
  homeContent: { padding: 16, paddingTop: 22, paddingBottom: 18 },
  coinPill: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 30, borderWidth: 1, borderColor: '#bf7e85', backgroundColor: '#fff3f7' },
  search: { marginTop: 22, marginBottom: 23, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fbf1fa', borderWidth: 1.5, borderColor: '#a769a2', borderRadius: 15, paddingHorizontal: 12, minHeight: 49 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
  roomCard: { backgroundColor: purple, borderRadius: 18, paddingBottom: 14, justifyContent: 'flex-end', elevation: 5 },
  liveTag: { position: 'absolute', zIndex: 2, right: 10, top: 10, backgroundColor: cream, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  cluster: { marginBottom: 13 },
  avatar: { backgroundColor: '#f5dbc9', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tabbar: { backgroundColor: '#f3e7f4', flexDirection: 'row', alignItems: 'flex-end', minHeight: 65, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  tab: { flex: 1, minHeight: 65, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  createTab: { marginTop: -13, borderRadius: 44, minHeight: 67, backgroundColor: '#ff9851' },
  roomHeader: { paddingHorizontal: 16, minHeight: 59, backgroundColor: '#2b1d42' },
  roomMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#483061', borderRadius: 12, padding: 9, marginVertical: 8, gap: 6 },
  seatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'space-between', marginVertical: 9 },
  seat: { aspectRatio: 0.72, borderWidth: 1, borderColor: '#79617c', borderRadius: 13, backgroundColor: '#604660', alignItems: 'center', justifyContent: 'center', gap: 3 },
  hostBadge: { position: 'absolute', top: 0, left: 3, zIndex: 2 },
  ring: { alignSelf: 'center', position: 'absolute', borderWidth: 9, borderTopColor: '#ac7ddf', borderLeftColor: '#ef9d72', borderRightColor: '#f1a76e', borderBottomColor: '#b388df', backgroundColor: '#351a78' },
  member: { position: 'absolute', alignItems: 'center', gap: 3 },
  mic: { borderRadius: 16, overflow: 'hidden', width: 20, textAlign: 'center', lineHeight: 20 },
  openSeat: { position: 'absolute', backgroundColor: '#726187', borderWidth: 1, borderColor: '#d4bacf', borderStyle: 'dashed', borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  chat: { borderRadius: 16, padding: 10, borderWidth: 1, borderColor: '#82658a', backgroundColor: '#483350', gap: 7 },
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 31 },
  giftStrip: { flexDirection: 'row', gap: 5, marginTop: 9 },
  giftTile: { flex: 1, backgroundColor: '#3c294e', borderWidth: 1, borderColor: '#5a4266', borderRadius: 13, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  composer: { backgroundColor: '#51374e', borderWidth: 1, borderColor: '#78576b', marginHorizontal: 14, marginBottom: 7, marginTop: 2, padding: 5, paddingLeft: 11, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  send: { backgroundColor: '#d96a59', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 19 },
  store: { paddingHorizontal: 25, paddingTop: 17, paddingBottom: 21 },
  storeIcon: { padding: 7, backgroundColor: purple, borderRadius: 14, overflow: 'hidden' },
  pack: { backgroundColor: 'white', borderRadius: 13, marginBottom: 11, minHeight: 72, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 4 },
  packBadge: { backgroundColor: '#e87539', position: 'absolute', right: 12, top: -6, borderRadius: 12, paddingHorizontal: 7, paddingVertical: 3, overflow: 'hidden' },
  buy: { paddingHorizontal: 15, paddingVertical: 7, backgroundColor: '#f88746', borderRadius: 10 },
  payment: { minHeight: 61, flex: 1, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', backgroundColor: '#f0e4f8', alignItems: 'center', justifyContent: 'center', gap: 3 },
  shade: { flex: 1, backgroundColor: '#140a2ab9', alignItems: 'center', justifyContent: 'center', padding: 22 },
  dialog: { borderRadius: 23, backgroundColor: cream, padding: 20, width: '100%', maxWidth: 440 },
  dialogAction: { marginTop: 11, borderRadius: 13, backgroundColor: purple, padding: 13, alignItems: 'center' },
  option: { backgroundColor: '#eee5f1', borderRadius: 10, marginVertical: 4, padding: 11 },
});

registerRootComponent(App);
