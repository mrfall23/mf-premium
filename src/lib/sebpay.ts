// Pays et opérateurs supportés par SebPay (zone FCFA uniquement : XAF = XOF, 1:1)
// Codes opérateurs = codes exacts attendus par l'API SebPay

export interface SebpayOperator {
  code: string;
  name: string;
  color: string;
  otp?: boolean; // l'opérateur exige un code OTP généré par le client
}

export interface SebpayCountry {
  code: string;
  name: string;
  flag: string;
  prefix: string; // indicatif sans le +
  currency: 'XAF' | 'XOF';
  operators: SebpayOperator[];
}

export const SEBPAY_COUNTRIES: SebpayCountry[] = [
  {
    code: 'CM', name: 'Cameroun', flag: '🇨🇲', prefix: '237', currency: 'XAF',
    operators: [
      { code: 'orange', name: 'Orange Money', color: '#ff7900' },
      { code: 'mtn', name: 'MTN MoMo', color: '#ffcc00' },
    ],
  },
  {
    code: 'BJ', name: 'Bénin', flag: '🇧🇯', prefix: '229', currency: 'XOF',
    operators: [
      { code: 'mtn', name: 'MTN Money', color: '#ffcc00' },
      { code: 'moov', name: 'Moov Money', color: '#009fe3' },
      { code: 'celtiis', name: 'Celtiis Money', color: '#00a651' },
      { code: 'coris', name: 'Coris Money', color: '#f39200' },
    ],
  },
  {
    code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', prefix: '225', currency: 'XOF',
    operators: [
      { code: 'orange', name: 'Orange Money', color: '#ff7900', otp: true },
      { code: 'mtn', name: 'MTN Money', color: '#ffcc00' },
      { code: 'moov', name: 'Moov Money', color: '#009fe3' },
      { code: 'wave', name: 'Wave', color: '#00b8f1' },
    ],
  },
  {
    code: 'SN', name: 'Sénégal', flag: '🇸🇳', prefix: '221', currency: 'XOF',
    operators: [
      { code: 'orange', name: 'Orange Money', color: '#ff7900', otp: true },
      { code: 'wave', name: 'Wave', color: '#00b8f1' },
      { code: 'free', name: 'Free Money', color: '#cd1e25' },
      { code: 'emoney', name: 'E-money', color: '#00a94f' },
    ],
  },
  {
    code: 'TG', name: 'Togo', flag: '🇹🇬', prefix: '228', currency: 'XOF',
    operators: [
      { code: 'moov', name: 'Moov Money', color: '#009fe3' },
      { code: 'tmoney', name: 'T-Money', color: '#ffd200' },
    ],
  },
  {
    code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', prefix: '226', currency: 'XOF',
    operators: [
      { code: 'orange', name: 'Orange Money', color: '#ff7900', otp: true },
      { code: 'moov', name: 'Moov Money', color: '#009fe3' },
      { code: 'wligdicash', name: 'LigdiCash', color: '#a855f7' },
    ],
  },
  {
    code: 'ML', name: 'Mali', flag: '🇲🇱', prefix: '223', currency: 'XOF',
    operators: [
      { code: 'orange', name: 'Orange Money', color: '#ff7900' },
      { code: 'moov', name: 'Moov Money', color: '#009fe3' },
    ],
  },
  {
    code: 'NE', name: 'Niger', flag: '🇳🇪', prefix: '227', currency: 'XOF',
    operators: [
      { code: 'airtel', name: 'Airtel Money', color: '#ed1c24' },
      { code: 'moov', name: 'Moov Money', color: '#009fe3' },
      { code: 'amanata', name: 'Amanata', color: '#a855f7' },
      { code: 'nita', name: 'Nita', color: '#a855f7' },
      { code: 'zamani', name: 'Zamani', color: '#a855f7' },
    ],
  },
  {
    code: 'GA', name: 'Gabon', flag: '🇬🇦', prefix: '241', currency: 'XAF',
    operators: [
      { code: 'airtel', name: 'Airtel Money', color: '#ed1c24' },
      { code: 'moov', name: 'Moov Money', color: '#009fe3' },
    ],
  },
  {
    code: 'CG', name: 'Congo', flag: '🇨🇬', prefix: '242', currency: 'XAF',
    operators: [
      { code: 'mtn', name: 'MTN Money', color: '#ffcc00' },
    ],
  },
  {
    code: 'TD', name: 'Tchad', flag: '🇹🇩', prefix: '235', currency: 'XAF',
    operators: [
      { code: 'AIRTEL', name: 'Airtel Money', color: '#ed1c24' },
      { code: 'MOOV', name: 'Moov Money', color: '#009fe3' },
    ],
  },
  {
    code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼', prefix: '245', currency: 'XOF',
    operators: [
      { code: 'orange', name: 'Orange Money', color: '#ff7900' },
    ],
  },
];

export function getSebpayCountry(code: string): SebpayCountry | undefined {
  return SEBPAY_COUNTRIES.find(c => c.code === code);
}
