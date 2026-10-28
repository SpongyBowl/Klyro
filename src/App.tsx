
import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import Auth from './Auth'
import './App.css'

type Message = {
  id: number
  name: string
  avatar: string
  color: string
  time: string
  text: string
  replyTo?: number
}

type Channel = {
  id: number
  name: string
  type: 'text' | 'voice'
  messages: Message[]
}

type Server = {
  id: number
  name: string
  icon: string
  channels: Channel[]
}

type EmojiCategory = {
  name: string
  icon: string
  emojis: string[]
}

type OnlineMember = {
  user_id: string
  username: string
  avatar: string
  color: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    name: 'Alex',
    avatar: 'A',
    color: 'purple',
    time: '14:20',
    text: 'Hey! Welcome to our server 👋'
  },
  {
    id: 2,
    name: 'Jamie',
    avatar: 'J',
    color: 'blue',
    time: '14:22',
    text: 'What do you think of the new design?'
  },
  {
    id: 3,
    name: 'Taylor',
    avatar: 'T',
    color: 'pink',
    time: '14:24',
    text: 'Looks really good! 🚀'
  }
]

function makeChannels(names: string[]): Channel[] {
  return names.map((name, index) => ({
    id: Date.now() + index,
    name,
    type: 'text',
    messages: name === 'general' ? [...initialMessages] : []
  }))
}

const initialServers: Server[] = [
  {
    id: 1,
    name: 'Klyro',
    icon: 'K',
    channels: [
      ...makeChannels([
        'general',
        'announcements',
        'gaming',
        'media',
        'off-topic'
      ]),
      { id: 101, name: 'Lounge', type: 'voice', messages: [] },
      { id: 102, name: 'Gaming room', type: 'voice', messages: [] }
    ]
  },
  {
    id: 2,
    name: 'Gaming',
    icon: 'G',
    channels: [
      ...makeChannels(['general', 'minecraft', 'gaming']),
      { id: 201, name: 'Gaming voice', type: 'voice', messages: [] }
    ]
  },
  {
    id: 3,
    name: 'Developers',
    icon: 'D',
    channels: makeChannels(['general', 'coding', 'projects'])
  }
]

const emojiCategories: EmojiCategory[] = [
  {
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️',
      '😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗',
      '😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓',
      '😎','🥸','🤩','🥳','🙂‍↕️','😏','😒','🙂‍↔️','😞','😔',
      '😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢',
      '😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😶‍🌫️',
      '😱','😨','😰','😥','😓','🫣','🤗','🫡','🤔','🫢',
      '🤭','🤫','🤥','😶','😐','😑','😬','🫨','🫠','🙄',
      '😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵',
      '🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠',
      '😈','👿','👻','💀','☠️','💩','🤡','👽','👾','🤖'
    ]
  },
  {
    name: 'People',
    icon: '👋',
    emojis: [
      '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌',
      '🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉',
      '👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛',
      '🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅',
      '🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠',
      '👀','👁️','👅','👄','🫦','💋','👶','🧒','👦','👧',
      '🧑','👨','👩','🧔','👱','🧓','👴','👵','🙍','🙎',
      '🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷','👮','🕵️',
      '💂','🥷','👷','🫅','🤴','👸','👳','👲','🧕','🤵',
      '👰','🤰','🫃','🫄','🤱','👼','🎅','🤶','🧑‍🎄'
    ]
  },
  {
    name: 'Animals',
    icon: '🐱',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨',
      '🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒',
      '🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇',
      '🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞',
      '🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🦂','🐢','🐍',
      '🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠',
      '🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓',
      '🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘',
      '🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌',
      '🐕','🐩','🦮','🐈','🐈‍⬛','🪶','🐓','🦃','🦚','🦜',
      '🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥',
      '🐁','🐀','🐿️','🦔'
    ]
  },
  {
    name: 'Food',
    icon: '🍕',
    emojis: [
      '🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐',
      '🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑',
      '🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅',
      '🥔','🍠','🫘','🥐','🥯','🍞','🥖','🥨','🧀','🥚',
      '🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭',
      '🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔',
      '🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱',
      '🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢',
      '🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭',
      '🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼',
      '☕','🫖','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂',
      '🍷','🥃','🍸','🍹','🧉','🍾','🧊'
    ]
  },
  {
    name: 'Activities',
    icon: '⚽',
    emojis: [
      '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱',
      '🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳',
      '🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷',
      '⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️',
      '🤺','🏇','🧘','🏄','🏊','🚴','🚵','🎯','🪄','🎮',
      '🕹️','🎲','♟️','🧩','🎭','🎨','🧵','🪡','🧶','🎼',
      '🎤','🎧','🎷','🎸','🎹','🎺','🎻','🪕','🥁','🪘',
      '🎬','🎮','🎰','🎳','🎪','🎟️','🎫','🎉','🎊','🎈',
      '🎁','🏆','🥇','🥈','🥉','🏅','🎖️','🎗️'
    ]
  },
  {
    name: 'Nature',
    icon: '🌿',
    emojis: [
      '🌍','🌎','🌏','🌐','🌑','🌒','🌓','🌔','🌕','🌖',
      '🌗','🌘','🌙','🌚','🌛','🌜','☀️','🌝','🌞','🪐',
      '⭐','🌟','🌠','🌌','☁️','⛅','🌤️','🌥️','🌦️','🌧️',
      '⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌪️','🌫️',
      '🌈','☔','💧','💦','🌊','🔥','🌱','🪴','🌲','🌳',
      '🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🪹',
      '🪺','🍄','🌷','🌸','🌹','🥀','🌺','🌻','🌼','🌽',
      '🪻','💐','🪷','🪸','🪨','🌑','🌕'
    ]
  },
  {
    name: 'Symbols',
    icon: '💜',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','🩷',
      '🩵','🩶','💔','❣️','💕','💞','💓','💗','💖','💘',
      '💝','💟','♥️','💌','💋','💯','💢','💥','💫','💦',
      '💨','🕳️','💬','👁️‍🗨️','🗨️','🗯️','💭','💤','✨','🌟',
      '⚡','🔥','💧','☀️','🌙','⭐','🌈','☮️','✝️','☯️',
      '♈','♉','♊','♋','♌','♍','♎','♏','♐','♑',
      '♒','♓','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪',
      '🟤','🔺','🔻','🔸','🔹','🔶','🔷','▪️','▫️','◾',
      '◽','⬛','⬜','🟥','🟧','🟨','🟩','🟦','🟪','🟫',
      '✅','❌','❎','➕','➖','➗','✖️','♾️','‼️','⁉️',
      '❓','❔','❕','❗','〰️','➰','➿','🔱','⚜️','🔰',
      '♻️','🔆','🔅','📛','🔰','⭕','🚫','💲','©️','®️','™️'
    ]
  }
]

// Search keywords for the emoji picker.
const emojiSearchTerms: Record<string, string> = {
  '😀': 'grin happy smile face',
  '😃': 'smile happy face',
  '😄': 'smile happy laugh face',
  '😁': 'grin happy face',
  '😆': 'laugh happy face',
  '😅': 'sweat laugh nervous',
  '😂': 'laugh laughing tears funny lol',
  '🤣': 'rofl rolling laugh funny',
  '🥲': 'smile tear emotional',
  '☺️': 'smile happy face',
  '😊': 'smile happy blush',
  '😇': 'angel innocent halo',
  '🙂': 'smile happy',
  '🙃': 'upside down silly',
  '😉': 'wink',
  '😌': 'relieved calm',
  '😍': 'love heart eyes',
  '🥰': 'love hearts affection',
  '😘': 'kiss love',
  '😗': 'kiss',
  '😙': 'kiss smile',
  '😚': 'kiss closed eyes',
  '😋': 'yum delicious tasty',
  '😛': 'tongue silly',
  '😝': 'tongue silly crazy',
  '😜': 'wink tongue silly',
  '🤪': 'crazy silly wild',
  '🤨': 'raised eyebrow suspicious',
  '🧐': 'monocle curious',
  '🤓': 'nerd glasses smart',
  '😎': 'cool sunglasses',
  '🥸': 'disguise glasses',
  '🤩': 'star struck excited',
  '🥳': 'party birthday celebration',
  '😏': 'smirk',
  '😒': 'unamused annoyed',
  '😞': 'disappointed sad',
  '😔': 'sad pensive',
  '😟': 'worried',
  '😕': 'confused',
  '🙁': 'sad frown',
  '☹️': 'sad frown',
  '😣': 'struggling',
  '😖': 'frustrated',
  '😫': 'tired exhausted',
  '😩': 'weary tired',
  '🥺': 'please pleading cute',
  '😢': 'cry sad tear',
  '😭': 'cry crying sob tears',
  '😤': 'angry frustrated',
  '😠': 'angry mad',
  '😡': 'angry rage mad',
  '🤬': 'swearing angry',
  '🤯': 'mind blown shocked',
  '😳': 'flushed embarrassed',
  '🥵': 'hot overheated',
  '🥶': 'cold freezing',
  '😱': 'scream scared shocked',
  '😨': 'fear scared',
  '😰': 'anxious nervous',
  '😥': 'sad relieved',
  '😓': 'sweat tired',
  '🫣': 'peek shy',
  '🤗': 'hug happy',
  '🫡': 'salute respect',
  '🤔': 'think thinking question',
  '🫢': 'gasp surprised',
  '🤭': 'giggle laugh',
  '🤫': 'shush quiet secret',
  '🤥': 'lie liar pinocchio',
  '😶': 'silent quiet speechless',
  '😐': 'neutral blank',
  '😑': 'expressionless',
  '😬': 'awkward grimace',
  '🫨': 'shaking shocked',
  '🫠': 'melting',
  '🙄': 'eye roll annoyed',
  '😯': 'surprised',
  '😦': 'shocked open mouth',
  '😧': 'anguished',
  '😮': 'wow surprised',
  '😲': 'astonished shocked',
  '🥱': 'yawn tired sleepy',
  '😴': 'sleep sleeping zzz',
  '🤤': 'drool',
  '😪': 'sleepy tired',
  '😵': 'dizzy',
  '🤐': 'zipper mouth quiet',
  '🥴': 'woozy dizzy',
  '🤢': 'sick nauseous',
  '🤮': 'vomit sick',
  '🤧': 'sneeze sick',
  '😷': 'mask sick',
  '🤒': 'sick thermometer',
  '🤕': 'injured bandage',
  '🤑': 'money rich',
  '🤠': 'cowboy hat',
  '😈': 'devil purple',
  '👿': 'angry devil',
  '👻': 'ghost spooky halloween',
  '💀': 'skull dead',
  '☠️': 'skull crossbones danger',
  '💩': 'poop poopoo',
  '🤡': 'clown',
  '👽': 'alien ufo',
  '👾': 'alien monster space invader',
  '🤖': 'robot',
  '👋': 'wave hello hi goodbye hand',
  '🤚': 'raised back hand',
  '🖐️': 'hand fingers',
  '✋': 'stop hand',
  '🖖': 'vulcan hand',
  '👌': 'ok okay perfect hand',
  '🤌': 'pinched fingers',
  '🤏': 'small little',
  '✌️': 'peace victory',
  '🤞': 'crossed fingers luck',
  '🫰': 'finger heart',
  '🤟': 'love you hand',
  '🤘': 'rock metal',
  '🤙': 'call me hand',
  '👈': 'point left',
  '👉': 'point right',
  '👆': 'point up',
  '👇': 'point down',
  '☝️': 'index finger up',
  '🫵': 'point at you',
  '👍': 'thumbs up like yes good',
  '👎': 'thumbs down dislike no bad',
  '✊': 'fist',
  '👊': 'punch fist',
  '👏': 'clap applause',
  '🙌': 'celebrate hands',
  '🫶': 'heart hands love',
  '🤝': 'handshake deal',
  '🙏': 'pray please thanks',
  '✍️': 'writing write',
  '💅': 'nail polish',
  '🤳': 'selfie phone',
  '💪': 'strong muscle flex',
  '🦾': 'robot arm',
  '🦿': 'robot leg',
  '🦵': 'leg',
  '🦶': 'foot',
  '👂': 'ear listen',
  '👃': 'nose smell',
  '🧠': 'brain smart',
  '👀': 'eyes look see',
  '👁️': 'eye look',
  '👅': 'tongue',
  '👄': 'mouth lips',
  '💋': 'kiss lips',
  '👶': 'baby',
  '🧒': 'child kid',
  '👦': 'boy',
  '👧': 'girl',
  '🧑': 'person',
  '👨': 'man',
  '👩': 'woman',
  '👴': 'old man',
  '👵': 'old woman',
  '🙋': 'raise hand question',
  '🤦': 'facepalm',
  '🤷': 'shrug',
  '🐶': 'dog puppy pet animal',
  '🐱': 'cat kitten pet animal',
  '🐭': 'mouse animal',
  '🐹': 'hamster animal pet',
  '🐰': 'rabbit bunny animal',
  '🦊': 'fox animal',
  '🐻': 'bear animal',
  '🐼': 'panda animal',
  '🐻‍❄️': 'polar bear animal',
  '🐨': 'koala animal',
  '🐯': 'tiger animal',
  '🦁': 'lion animal',
  '🐮': 'cow animal',
  '🐷': 'pig animal',
  '🐸': 'frog animal',
  '🐵': 'monkey animal',
  '🐔': 'chicken animal',
  '🐧': 'penguin animal',
  '🐦': 'bird animal',
  '🦆': 'duck animal',
  '🦅': 'eagle bird',
  '🦉': 'owl bird',
  '🐺': 'wolf animal',
  '🐴': 'horse animal',
  '🦄': 'unicorn magic',
  '🐝': 'bee insect',
  '🦋': 'butterfly insect',
  '🐌': 'snail animal',
  '🐞': 'ladybug insect',
  '🐢': 'turtle animal',
  '🐍': 'snake animal',
  '🦎': 'lizard animal',
  '🦖': 'dinosaur t-rex',
  '🦕': 'dinosaur',
  '🐙': 'octopus sea',
  '🦑': 'squid sea',
  '🦀': 'crab sea',
  '🐠': 'fish tropical sea',
  '🐟': 'fish sea',
  '🐬': 'dolphin sea',
  '🐳': 'whale sea',
  '🦈': 'shark sea',
  '🐊': 'crocodile animal',
  '🐘': 'elephant animal',
  '🦒': 'giraffe animal',
  '🐎': 'horse animal',
  '🐕': 'dog pet',
  '🐈': 'cat pet',
  '🦔': 'hedgehog animal',
  '🍏': 'green apple fruit',
  '🍎': 'apple red fruit',
  '🍐': 'pear fruit',
  '🍊': 'orange fruit',
  '🍋': 'lemon fruit',
  '🍌': 'banana fruit',
  '🍉': 'watermelon fruit',
  '🍇': 'grapes fruit',
  '🍓': 'strawberry fruit',
  '🫐': 'blueberry fruit',
  '🍒': 'cherry fruit',
  '🍑': 'peach fruit',
  '🥭': 'mango fruit',
  '🍍': 'pineapple fruit',
  '🥥': 'coconut fruit',
  '🥝': 'kiwi fruit',
  '🍅': 'tomato vegetable',
  '🍆': 'eggplant vegetable',
  '🥑': 'avocado vegetable',
  '🥦': 'broccoli vegetable',
  '🥕': 'carrot vegetable',
  '🌽': 'corn vegetable',
  '🥔': 'potato vegetable',
  '🍞': 'bread',
  '🥐': 'croissant',
  '🧀': 'cheese',
  '🥚': 'egg',
  '🍳': 'cooking egg',
  '🥞': 'pancakes breakfast',
  '🥓': 'bacon',
  '🍗': 'chicken food',
  '🌭': 'hot dog food',
  '🍔': 'burger hamburger food',
  '🍟': 'fries french fries food',
  '🍕': 'pizza food',
  '🥪': 'sandwich food',
  '🌮': 'taco food',
  '🌯': 'burrito food',
  '🥗': 'salad food',
  '🍝': 'spaghetti pasta food',
  '🍜': 'noodles ramen food',
  '🍲': 'soup food',
  '🍣': 'sushi food',
  '🍱': 'bento food',
  '🍤': 'shrimp food',
  '🍚': 'rice food',
  '🍦': 'ice cream dessert',
  '🍨': 'ice cream dessert',
  '🍩': 'donut doughnut dessert',
  '🍪': 'cookie dessert',
  '🎂': 'birthday cake dessert',
  '🍰': 'cake dessert',
  '🧁': 'cupcake dessert',
  '🍫': 'chocolate sweet',
  '🍬': 'candy sweet',
  '🍭': 'lollipop candy',
  '🍿': 'popcorn snack movie',
  '☕': 'coffee hot drink',
  '🫖': 'teapot tea',
  '🍵': 'tea drink',
  '🥤': 'drink cup soda',
  '🧋': 'bubble tea boba drink',
  '🍺': 'beer drink',
  '🍹': 'tropical drink',
  '⚽': 'soccer football sport',
  '🏀': 'basketball sport',
  '🏈': 'american football sport',
  '⚾': 'baseball sport',
  '🎾': 'tennis sport',
  '🏐': 'volleyball sport',
  '🏓': 'ping pong table tennis',
  '🏸': 'badminton sport',
  '🥊': 'boxing sport',
  '🥋': 'martial arts sport',
  '🛹': 'skateboard sport',
  '🎿': 'ski skiing sport',
  '🏂': 'snowboard sport',
  '🏋️': 'weightlifting gym sport',
  '🏄': 'surfing sport',
  '🏊': 'swimming sport',
  '🚴': 'cycling bike sport',
  '🎯': 'target bullseye',
  '🎮': 'gaming game controller video game',
  '🕹️': 'joystick gaming video game',
  '🎲': 'dice game',
  '♟️': 'chess game',
  '🧩': 'puzzle game',
  '🎨': 'art painting',
  '🎤': 'microphone singing music',
  '🎧': 'headphones music gaming',
  '🎸': 'guitar music',
  '🎹': 'piano music',
  '🥁': 'drums music',
  '🎬': 'movie film',
  '🎳': 'bowling sport',
  '🎉': 'party celebration',
  '🎊': 'confetti celebration',
  '🎈': 'balloon party',
  '🎁': 'gift present',
  '🏆': 'trophy winner prize',
  '🥇': 'gold medal first place',
  '🥈': 'silver medal second place',
  '🥉': 'bronze medal third place',
  '🌍': 'earth globe world',
  '🌎': 'earth globe world',
  '🌏': 'earth globe world',
  '🌙': 'moon night',
  '☀️': 'sun sunny weather',
  '⭐': 'star',
  '🌟': 'glowing star',
  '🌌': 'milky way galaxy space',
  '☁️': 'cloud weather',
  '⛅': 'sun cloud weather',
  '🌧️': 'rain weather',
  '⛈️': 'thunderstorm weather',
  '❄️': 'snow snowflake cold winter',
  '🌈': 'rainbow',
  '☔': 'umbrella rain',
  '💧': 'water drop',
  '🌊': 'ocean wave water',
  '🔥': 'fire flame hot',
  '🌱': 'plant seed',
  '🪴': 'plant potted',
  '🌲': 'tree evergreen',
  '🌳': 'tree',
  '🌴': 'palm tree',
  '🌵': 'cactus',
  '🍀': 'four leaf clover luck',
  '🍁': 'maple leaf autumn',
  '🍄': 'mushroom',
  '🌷': 'tulip flower',
  '🌸': 'cherry blossom flower',
  '🌹': 'rose flower',
  '🌻': 'sunflower',
  '🌼': 'flower',
  '❤️': 'red heart love',
  '🧡': 'orange heart love',
  '💛': 'yellow heart love',
  '💚': 'green heart love',
  '💙': 'blue heart love',
  '💜': 'purple heart love',
  '🖤': 'black heart love',
  '🤍': 'white heart love',
  '🤎': 'brown heart love',
  '🩷': 'pink heart love',
  '🩵': 'light blue heart love',
  '🩶': 'grey heart love',
  '💔': 'broken heart sad',
  '💕': 'two hearts love',
  '💞': 'revolving hearts love',
  '💓': 'beating heart love',
  '💗': 'growing heart love',
  '💖': 'sparkling heart love',
  '💘': 'heart arrow love',
  '💝': 'heart gift love',
  '💯': 'hundred perfect score',
  '💥': 'explosion boom',
  '💫': 'dizzy star',
  '✨': 'sparkles shine magic',
  '⚡': 'lightning bolt electricity',
  '☮️': 'peace symbol',
  '☯️': 'yin yang',
  '🔴': 'red circle',
  '🟠': 'orange circle',
  '🟡': 'yellow circle',
  '🟢': 'green circle',
  '🔵': 'blue circle',
  '🟣': 'purple circle',
  '⚫': 'black circle',
  '⚪': 'white circle',
  '✅': 'check yes done correct',
  '❌': 'cross no wrong',
  '❓': 'question mark help',
  '❗': 'exclamation mark important',
  '♻️': 'recycle recycling'
}

// Shortcodes that can be typed directly into the chat.
// Example: :pizza: becomes 🍕
const emojiShortcodes: Record<string, string> = {
  smile: '😄',
  grinning: '😀',
  grin: '😁',
  happy: '😊',
  laugh: '😂',
  joy: '😂',
  rofl: '🤣',
  wink: '😉',
  blush: '😊',
  heart_eyes: '😍',
  love: '❤️',
  heart: '❤️',
  broken_heart: '💔',
  purple_heart: '💜',
  blue_heart: '💙',
  green_heart: '💚',
  yellow_heart: '💛',
  orange_heart: '🧡',
  black_heart: '🖤',
  white_heart: '🤍',
  crying: '😭',
  sob: '😭',
  sad: '😢',
  angry: '😡',
  rage: '😡',
  thinking: '🤔',
  think: '🤔',
  shrug: '🤷',
  facepalm: '🤦',
  cool: '😎',
  sunglasses: '😎',
  party: '🥳',
  tada: '🎉',
  clap: '👏',
  wave: '👋',
  hello: '👋',
  goodbye: '👋',
  thumbs_up: '👍',
  thumbsup: '👍',
  '+1': '👍',
  thumbs_down: '👎',
  thumb_down: '👎',
  pray: '🙏',
  muscle: '💪',
  fire: '🔥',
  flame: '🔥',
  sparkles: '✨',
  star: '⭐',
  star2: '🌟',
  rainbow: '🌈',
  sun: '☀️',
  moon: '🌙',
  lightning: '⚡',
  rocket: '🚀',
  ghost: '👻',
  skull: '💀',
  poop: '💩',
  robot: '🤖',
  alien: '👽',
  dog: '🐶',
  cat: '🐱',
  mouse: '🐭',
  hamster: '🐹',
  rabbit: '🐰',
  bunny: '🐰',
  fox: '🦊',
  bear: '🐻',
  panda: '🐼',
  tiger: '🐯',
  lion: '🦁',
  cow: '🐮',
  pig: '🐷',
  frog: '🐸',
  monkey: '🐵',
  chicken: '🐔',
  penguin: '🐧',
  bird: '🐦',
  duck: '🦆',
  wolf: '🐺',
  horse: '🐴',
  unicorn: '🦄',
  bee: '🐝',
  butterfly: '🦋',
  turtle: '🐢',
  snake: '🐍',
  dinosaur: '🦖',
  octopus: '🐙',
  crab: '🦀',
  fish: '🐟',
  dolphin: '🐬',
  whale: '🐳',
  shark: '🦈',
  elephant: '🐘',
  pizza: '🍕',
  burger: '🍔',
  hamburger: '🍔',
  fries: '🍟',
  french_fries: '🍟',
  apple: '🍎',
  green_apple: '🍏',
  pear: '🍐',
  orange: '🍊',
  lemon: '🍋',
  banana: '🍌',
  watermelon: '🍉',
  grapes: '🍇',
  strawberry: '🍓',
  blueberry: '🫐',
  cherry: '🍒',
  peach: '🍑',
  mango: '🥭',
  pineapple: '🍍',
  avocado: '🥑',
  carrot: '🥕',
  potato: '🥔',
  bread: '🍞',
  cheese: '🧀',
  egg: '🥚',
  bacon: '🥓',
  hotdog: '🌭',
  hot_dog: '🌭',
  sandwich: '🥪',
  taco: '🌮',
  burrito: '🌯',
  salad: '🥗',
  pasta: '🍝',
  spaghetti: '🍝',
  ramen: '🍜',
  noodles: '🍜',
  sushi: '🍣',
  rice: '🍚',
  icecream: '🍦',
  ice_cream: '🍦',
  donut: '🍩',
  doughnut: '🍩',
  cookie: '🍪',
  cake: '🎂',
  birthday: '🎂',
  cupcake: '🧁',
  chocolate: '🍫',
  candy: '🍬',
  popcorn: '🍿',
  coffee: '☕',
  tea: '🍵',
  bubble_tea: '🧋',
  boba: '🧋',
  soccer: '⚽',
  football: '🏈',
  basketball: '🏀',
  baseball: '⚾',
  tennis: '🎾',
  volleyball: '🏐',
  gaming: '🎮',
  game: '🎮',
  controller: '🎮',
  trophy: '🏆',
  medal: '🥇',
  target: '🎯',
  dice: '🎲',
  music: '🎵',
  headphones: '🎧',
  microphone: '🎤',
  guitar: '🎸',
  piano: '🎹',
  camera: '📷',
  computer: '💻',
  laptop: '💻',
  phone: '📱',
  bulb: '💡',
  idea: '💡',
  house: '🏠',
  car: '🚗',
  airplane: '✈️',
  plane: '✈️',
  train: '🚂',
  gift: '🎁',
  present: '🎁',
  balloon: '🎈',
  check: '✅',
  white_check_mark: '✅',
  x: '❌',
  cross: '❌',
  question: '❓',
  exclamation: '❗',
  hundred: '💯',
  recycle: '♻️'
}

function convertEmojiShortcodes(text: string): string {
  return text.replace(/:([a-z0-9_+-]+):/gi, (match, shortcode: string) => {
    return emojiShortcodes[shortcode.toLowerCase()] ?? match
  })
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([])

  const [servers, setServers] = useState<Server[]>(initialServers)
  const [activeServerId, setActiveServerId] = useState(1)
  const [activeChannelId, setActiveChannelId] = useState(
    initialServers[0].channels[0].id
  )

  const [message, setMessage] = useState('')
  const [replyToId, setReplyToId] = useState<number | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [emojiSearch, setEmojiSearch] = useState('')
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Smileys')
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null)

  const [isServerModalOpen, setIsServerModalOpen] = useState(false)
  const [newServerName, setNewServerName] = useState('')
  const [newServerIcon, setNewServerIcon] = useState('N')
  const [serverToDelete, setServerToDelete] = useState<number | null>(null)

  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text')
  const [editingChannelId, setEditingChannelId] = useState<number | null>(null)
  const [channelToDelete, setChannelToDelete] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Session error:', error)
      if (mounted) {
        setSession(data.session)
        setAuthLoading(false)
      }
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setAuthLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const activeServer = servers.find(
    server => server.id === activeServerId
  ) ?? servers[0]

  const activeChannel = activeServer?.channels.find(
    channel => channel.id === activeChannelId
  )

  const username =
    session?.user.user_metadata?.username ||
    session?.user.email?.split('@')[0] ||
    'Klyro User'

  const avatarLetter = username.charAt(0).toUpperCase()

  // Track users who are currently connected to Klyro.
  useEffect(() => {
    if (!session?.user) {
      setOnlineMembers([])
      return
    }

    const user = session.user

    const presenceChannel = supabase.channel('klyro-online-users', {
      config: {
        presence: {
          key: user.id
        }
      }
    })

    const updateOnlineMembers = () => {
      const presenceState = presenceChannel.presenceState()

      const allMembers = Object.values(presenceState).flat() as OnlineMember[]

      const uniqueMembers = allMembers.filter(
        (member, index, array) =>
          array.findIndex(item => item.user_id === member.user_id) === index
      )

      setOnlineMembers(uniqueMembers)
    }

    presenceChannel
      .on('presence', { event: 'sync' }, updateOnlineMembers)
      .on('presence', { event: 'join' }, updateOnlineMembers)
      .on('presence', { event: 'leave' }, updateOnlineMembers)
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            username,
            avatar: avatarLetter,
            color: 'purple'
          })
        }
      })

    return () => {
      setOnlineMembers([])
      void supabase.removeChannel(presenceChannel)
    }
  }, [session, username, avatarLetter])

  const selectedCategory = emojiCategories.find(
    category => category.name === activeEmojiCategory
  ) ?? emojiCategories[0]

  const searchTerm = emojiSearch.trim().toLowerCase()

  const allEmojis = [
    ...new Set(emojiCategories.flatMap(category => category.emojis))
  ]

  const filteredEmojis = searchTerm
    ? allEmojis.filter(emoji => {
        const terms = emojiSearchTerms[emoji] ?? ''
        return (
          terms.toLowerCase().includes(searchTerm) ||
          emoji.includes(searchTerm)
        )
      })
    : selectedCategory.emojis

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error:', error.message)
  }

  function updateServerChannels(
    serverId: number,
    update: (channels: Channel[]) => Channel[]
  ) {
    setServers(previous =>
      previous.map(server =>
        server.id === serverId
          ? { ...server, channels: update(server.channels) }
          : server
      )
    )
  }

  function updateActiveMessages(update: (messages: Message[]) => Message[]) {
    if (!activeServer || !activeChannel) return

    updateServerChannels(activeServer.id, channels =>
      channels.map(channel =>
        channel.id === activeChannel.id
          ? { ...channel, messages: update(channel.messages) }
          : channel
      )
    )
  }

  function selectServer(serverId: number) {
    const server = servers.find(item => item.id === serverId)
    if (!server) return

    setActiveServerId(serverId)

    if (server.channels.length > 0) {
      setActiveChannelId(server.channels[0].id)
    }
  }

  function createServer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const name = newServerName.trim()
    if (!name) return

    const newServer: Server = {
      id: Date.now(),
      name,
      icon: newServerIcon,
      channels: makeChannels(['general', 'announcements', 'gaming'])
    }

    setServers(previous => [...previous, newServer])
    setActiveServerId(newServer.id)
    setActiveChannelId(newServer.channels[0].id)
    setNewServerName('')
    setNewServerIcon('N')
    setIsServerModalOpen(false)
  }

  function deleteServer() {
    if (serverToDelete === null || servers.length <= 1) return

    const remaining = servers.filter(
      server => server.id !== serverToDelete
    )

    setServers(remaining)

    if (activeServerId === serverToDelete) {
      const nextServer = remaining[0]
      setActiveServerId(nextServer.id)
      setActiveChannelId(nextServer.channels[0].id)
    }

    setServerToDelete(null)
    setReplyToId(null)
    setEditingMessageId(null)
    setMessage('')
  }

  function openCreateChannel(type: 'text' | 'voice') {
    setChannelName('')
    setChannelType(type)
    setEditingChannelId(null)
    setIsChannelModalOpen(true)
  }

  function openEditChannel(channel: Channel) {
    setChannelName(channel.name)
    setChannelType(channel.type)
    setEditingChannelId(channel.id)
    setIsChannelModalOpen(true)
  }

  function saveChannel(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const name = channelName.trim()
    if (!name || !activeServer) return

    if (editingChannelId !== null) {
      updateServerChannels(activeServer.id, channels =>
        channels.map(channel =>
          channel.id === editingChannelId ? { ...channel, name } : channel
        )
      )
    } else {
      const newChannel: Channel = {
        id: Date.now(),
        name,
        type: channelType,
        messages: []
      }

      updateServerChannels(activeServer.id, channels => [
        ...channels,
        newChannel
      ])
      setActiveChannelId(newChannel.id)
    }

    setIsChannelModalOpen(false)
    setChannelName('')
    setEditingChannelId(null)
  }

  function deleteChannel() {
    if (channelToDelete === null || !activeServer) return

    const remaining = activeServer.channels.filter(
      channel => channel.id !== channelToDelete
    )

    if (remaining.length === 0) {
      setChannelToDelete(null)
      return
    }

    updateServerChannels(activeServer.id, channels =>
      channels.filter(channel => channel.id !== channelToDelete)
    )

    if (activeChannelId === channelToDelete) {
      setActiveChannelId(remaining[0].id)
    }

    setChannelToDelete(null)
  }

  function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!message.trim() || !activeServer || !activeChannel) return
    if (activeChannel.type !== 'text') return

    const convertedMessage = convertEmojiShortcodes(message.trim())

    if (editingMessageId !== null) {
      updateActiveMessages(messages =>
        messages.map(msg =>
          msg.id === editingMessageId
            ? { ...msg, text: convertedMessage }
            : msg
        )
      )
      setEditingMessageId(null)
      setMessage('')
      return
    }

    const newMessage: Message = {
      id: Date.now(),
      name: username,
      avatar: avatarLetter,
      color: 'purple',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      text: convertedMessage,
      ...(replyToId !== null ? { replyTo: replyToId } : {})
    }

    updateActiveMessages(messages => [...messages, newMessage])
    setMessage('')
    setReplyToId(null)
    setIsEmojiPickerOpen(false)
  }

  function startReply(msg: Message) {
    setReplyToId(msg.id)
    setEditingMessageId(null)
    setMessage('')
  }

  function startEdit(msg: Message) {
    if (msg.name !== username) return
    setEditingMessageId(msg.id)
    setReplyToId(null)
    setMessage(msg.text)
    setIsEmojiPickerOpen(false)
  }

  function deleteMessage() {
    if (messageToDelete === null) return

    updateActiveMessages(messages =>
      messages.filter(msg => msg.id !== messageToDelete)
    )

    setMessageToDelete(null)
    if (replyToId === messageToDelete) setReplyToId(null)
  }

  function insertEmoji(emoji: string) {
    setMessage(previous => previous + emoji)
  }

  const replyingTo = activeChannel?.messages.find(
    msg => msg.id === replyToId
  )

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">K</div>
          <h1>Klyro</h1>
          <p className="auth-subtitle">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="app-shell">
      <aside className="server-sidebar">
        <div className="brand-mark">K</div>
        <div className="sidebar-divider" />

        {servers.map(server => (
          <button
            key={server.id}
            className={`server-icon ${
              activeServerId === server.id ? 'selected' : ''
            }`}
            title={server.name}
            onClick={() => selectServer(server.id)}
          >
            {server.icon}
          </button>
        ))}

        <button
          className="add-server"
          title="Create a server"
          onClick={() => setIsServerModalOpen(true)}
        >
          +
        </button>

        <div className="server-bottom">?</div>
      </aside>

      <aside className="channel-sidebar">
        <header className="server-header">
          <div>
            <strong>{activeServer?.name}</strong>
            <span>Community space</span>
          </div>
          <button
            className="more-button"
            title="Delete this server"
            disabled={servers.length <= 1}
            onClick={() => setServerToDelete(activeServer.id)}
          >
            🗑
          </button>
        </header>

        <div className="channel-content">
          <div className="category-heading">
            TEXT CHANNELS
            <button
              type="button"
              className="category-add"
              title="Create text channel"
              onClick={() => openCreateChannel('text')}
            >
              +
            </button>
          </div>

          {activeServer?.channels
            .filter(channel => channel.type === 'text')
            .map(channel => (
              <div
                className={`channel-row ${
                  activeChannelId === channel.id ? 'active' : ''
                }`}
                key={channel.id}
              >
                <button
                  className="channel-item"
                  onClick={() => {
                    setActiveChannelId(channel.id)
                    setReplyToId(null)
                    setEditingMessageId(null)
                    setMessage('')
                  }}
                >
                  <span className="hash">#</span>
                  <span className="channel-name">{channel.name}</span>
                </button>

                <div className="channel-actions">
                  <button
                    title="Rename channel"
                    onClick={() => openEditChannel(channel)}
                  >
                    ✎
                  </button>
                  <button
                    title="Delete channel"
                    onClick={() => setChannelToDelete(channel.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

          <div className="category-heading voice-heading">
            VOICE CHANNELS
            <button
              type="button"
              className="category-add"
              title="Create voice channel"
              onClick={() => openCreateChannel('voice')}
            >
              +
            </button>
          </div>

          {activeServer?.channels
            .filter(channel => channel.type === 'voice')
            .map(channel => (
              <div
                className={`channel-row ${
                  activeChannelId === channel.id ? 'active' : ''
                }`}
                key={channel.id}
              >
                <button
                  className="channel-item"
                  onClick={() => {
                    setActiveChannelId(channel.id)
                    setReplyToId(null)
                    setEditingMessageId(null)
                    setMessage('')
                  }}
                >
                  <span className="voice-icon">◖</span>
                  <span className="channel-name">{channel.name}</span>
                </button>

                <div className="channel-actions">
                  <button
                    title="Rename channel"
                    onClick={() => openEditChannel(channel)}
                  >
                    ✎
                  </button>
                  <button
                    title="Delete channel"
                    onClick={() => setChannelToDelete(channel.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="profile-panel">
          <div className="avatar purple">{avatarLetter}</div>
          <div className="profile-info">
            <strong>{username}</strong>
            <span><i className="online-dot" /> Online</span>
          </div>
          <button
            className="profile-action"
            title="Sign out"
            onClick={handleSignOut}
          >
            ⇥
          </button>
        </div>
      </aside>

      <main className="chat-panel">
        <header className="chat-topbar">
          <div className="channel-title">
            <span>{activeChannel?.type === 'voice' ? '◖' : '#'}</span>
            <strong>{activeChannel?.name ?? 'No channel'}</strong>
            <small>{activeServer?.name}</small>
          </div>

          <div className="topbar-actions">
            <button>⌕</button>
            <button>♧</button>
            <button>⋯</button>
          </div>
        </header>

        {activeChannel?.type === 'voice' ? (
          <section className="voice-placeholder">
            <div className="voice-placeholder-icon"><span>◖</span></div>
            <h2>{activeChannel.name}</h2>
            <p>This voice channel is ready for future voice chat.</p>
            <span className="voice-coming-soon">VOICE CHAT COMING SOON</span>
          </section>
        ) : (
          <>
            <section className="messages-area">
              <div className="channel-intro">
                <div className="intro-hash">#</div>
                <h1>Welcome to #{activeChannel?.name}</h1>
                <p>This is the beginning of the conversation.</p>
              </div>

              <div className="message-list">
                {activeChannel?.messages.map(msg => {
                  const repliedMessage = activeChannel.messages.find(
                    item => item.id === msg.replyTo
                  )

                  return (
                    <article className="message" key={msg.id}>
                      <div className={`avatar ${msg.color}`}>
                        {msg.avatar}
                      </div>

                      <div className="message-body">
                        {repliedMessage && (
                          <div className="reply-preview">
                            <span>↳ Reply to {repliedMessage.name}:</span>
                            <p>{repliedMessage.text}</p>
                          </div>
                        )}

                        <div className="message-meta">
                          <strong>{msg.name}</strong>
                          <time>{msg.time}</time>
                          {msg.name === username && (
                            <span className="edited-label">your message</span>
                          )}
                        </div>

                        <p>{msg.text}</p>

                        <div className="message-actions">
                          <button
                            type="button"
                            title="Reply"
                            onClick={() => startReply(msg)}
                          >
                            ↩ Reply
                          </button>

                          {msg.name === username && (
                            <>
                              <button
                                type="button"
                                title="Edit message"
                                onClick={() => startEdit(msg)}
                              >
                                ✎ Edit
                              </button>
                              <button
                                type="button"
                                title="Delete message"
                                onClick={() => setMessageToDelete(msg.id)}
                              >
                                × Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <div className="composer-wrap">
              {replyingTo && (
                <div className="composer-context">
                  <span>
                    Replying to <strong>{replyingTo.name}</strong>:{' '}
                    {replyingTo.text}
                  </span>
                  <button type="button" onClick={() => setReplyToId(null)}>
                    ×
                  </button>
                </div>
              )}

              {editingMessageId !== null && (
                <div className="composer-context editing-context">
                  <span>Editing your message</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMessageId(null)
                      setMessage('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {isEmojiPickerOpen && (
                <div className="emoji-picker">
                  <div className="emoji-picker-heading">
                    <div>
                      <strong>Emoji Picker</strong>
                      <span>Find the perfect emoji</span>
                    </div>
                    <button
                      type="button"
                      className="emoji-close"
                      onClick={() => {
                        setIsEmojiPickerOpen(false)
                        setEmojiSearch('')
                      }}
                      title="Close emoji picker"
                    >
                      ×
                    </button>
                  </div>

                  <input
                    className="emoji-search"
                    type="search"
                    placeholder="Search emojis... (e.g. dog, heart, pizza)"
                    value={emojiSearch}
                    onChange={e => setEmojiSearch(e.target.value)}
                  />

                  {!searchTerm && (
                    <div className="emoji-categories">
                      {emojiCategories.map(category => (
                        <button
                          type="button"
                          key={category.name}
                          className={
                            activeEmojiCategory === category.name ? 'active' : ''
                          }
                          title={category.name}
                          onClick={() => setActiveEmojiCategory(category.name)}
                        >
                          <span>{category.icon}</span>
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="emoji-section-title">
                    {searchTerm
                      ? `Search results (${filteredEmojis.length})`
                      : selectedCategory.name}
                  </div>

                  <div className="emoji-grid">
                    {filteredEmojis.map((emoji, index) => (
                      <button
                        type="button"
                        key={`${emoji}-${index}`}
                        title={`Insert ${emoji}`}
                        onClick={() => insertEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {filteredEmojis.length === 0 && (
                    <div className="emoji-empty">
                      No emojis found. Try another search.
                    </div>
                  )}
                </div>
              )}

              <form className="message-form" onSubmit={sendMessage}>
                <button
                  type="button"
                  className="attach-button"
                  title="Emoji"
                  onClick={() => {
                    setIsEmojiPickerOpen(open => !open)
                    setEmojiSearch('')
                  }}
                >
                  ☺
                </button>

                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={
                    editingMessageId !== null
                      ? 'Edit your message...'
                      : `Message #${activeChannel?.name ?? ''}`
                  }
                />

                <button type="submit" className="send-button">
                  {editingMessageId !== null ? '✓' : '➤'}
                </button>
              </form>
            </div>
          </>
        )}
      </main>

      <aside className="members-sidebar">
        <div className="members-title">
          MEMBERS <span>{onlineMembers.length}</span>
        </div>

        <div>
          <div className="member-group">
            ONLINE — {onlineMembers.length}
          </div>

          {onlineMembers.map(member => (
            <div
              className="member online"
              key={member.user_id}
            >
              <div className={`avatar ${member.color}`}>
                {member.avatar}
              </div>
              <div className="member-info">
                <strong>{member.username}</strong>
                <span>Online</span>
              </div>
              <i className="status-dot online" />
            </div>
          ))}

          {onlineMembers.length === 0 && (
            <p className="member-info">No users online</p>
          )}
        </div>
      </aside>

      {isServerModalOpen && (
        <div className="modal-overlay">
          <div className="create-server-modal">
            <button
              className="modal-close"
              onClick={() => setIsServerModalOpen(false)}
              type="button"
            >
              ×
            </button>

            <div className="modal-icon">+</div>
            <h2>Create your server</h2>
            <p>Give your new community a name and choose an icon.</p>

            <form onSubmit={createServer}>
              <label htmlFor="server-name">SERVER NAME</label>
              <input
                id="server-name"
                className="server-name-input"
                value={newServerName}
                onChange={e => setNewServerName(e.target.value)}
                placeholder="Enter a server name..."
                maxLength={30}
                required
              />

              <label>CHOOSE AN ICON</label>
              <div className="icon-choices">
                {['N', 'G', 'M', 'D', 'C', 'S'].map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-choice ${
                      newServerIcon === icon ? 'chosen' : ''
                    }`}
                    onClick={() => setNewServerIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsServerModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="create-button"
                  disabled={!newServerName.trim()}
                >
                  Create Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isChannelModalOpen && (
        <div className="modal-overlay">
          <div className="create-server-modal channel-modal">
            <button
              className="modal-close"
              type="button"
              onClick={() => setIsChannelModalOpen(false)}
            >
              ×
            </button>

            <div className="modal-icon">
              {channelType === 'text' ? '#' : '◖'}
            </div>

            <h2>
              {editingChannelId !== null ? 'Edit channel' : 'Create a channel'}
            </h2>

            <p>
              {editingChannelId !== null
                ? 'Change the name of your channel.'
                : 'Choose a name and channel type for your community.'}
            </p>

            <form onSubmit={saveChannel}>
              {editingChannelId === null && (
                <>
                  <label>CHANNEL TYPE</label>
                  <div className="channel-type-choices">
                    <button
                      type="button"
                      className={channelType === 'text' ? 'chosen' : ''}
                      onClick={() => setChannelType('text')}
                    >
                      # Text
                    </button>
                    <button
                      type="button"
                      className={channelType === 'voice' ? 'chosen' : ''}
                      onClick={() => setChannelType('voice')}
                    >
                      ◖ Voice
                    </button>
                  </div>
                </>
              )}

              <label htmlFor="channel-name">CHANNEL NAME</label>
              <input
                id="channel-name"
                className="server-name-input"
                value={channelName}
                onChange={e =>
                  setChannelName(
                    e.target.value.toLowerCase().replace(/\s+/g, '-')
                  )
                }
                placeholder="e.g. general"
                maxLength={30}
                autoFocus
                required
              />

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsChannelModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="create-button"
                  disabled={!channelName.trim()}
                >
                  {editingChannelId !== null ? 'Save Changes' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {serverToDelete !== null && (
        <div className="modal-overlay">
          <div className="create-server-modal delete-modal">
            <div className="modal-icon delete-icon">!</div>
            <h2>Delete server?</h2>
            <p>
              Are you sure you want to delete this server?
              Its channels and messages will also be removed.
            </p>

            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setServerToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-button"
                onClick={deleteServer}
              >
                Delete Server
              </button>
            </div>
          </div>
        </div>
      )}

      {channelToDelete !== null && (
        <div className="modal-overlay">
          <div className="create-server-modal delete-modal">
            <div className="modal-icon delete-icon">!</div>
            <h2>Delete channel?</h2>
            <p>
              Are you sure you want to delete this channel?
              Its messages will also be removed.
            </p>

            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setChannelToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-button"
                onClick={deleteChannel}
              >
                Delete Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {messageToDelete !== null && (
        <div className="modal-overlay">
          <div className="create-server-modal delete-modal">
            <div className="modal-icon delete-icon">!</div>
            <h2>Delete message?</h2>
            <p>Are you sure you want to delete this message?</p>

            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setMessageToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-button"
                onClick={deleteMessage}
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
