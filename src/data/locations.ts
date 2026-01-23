// Location data extracted from the Excel/JSON file - 55 locations
export interface Location {
  uniorg: string;
  local: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  climaTempoCod: number;
  climatTempoName: string;
}

export const locations: Location[] = [
  // AC
  { uniorg: "12402", local: "CRUZEIRO DO SUL-AC", address: "AV CEL MANCIO LIMA 745", city: "CRUZEIRO DO SUL", state: "AC", latitude: -7.62179, longitude: -72.679181, climaTempoCod: 4908, climatTempoName: "CRUZEIRO DO SUL" },
  { uniorg: "11947", local: "SELECT ACRE-AC", address: "R MAL DEODORO 623", city: "RIO BRANCO", state: "AC", latitude: -9.971388, longitude: -67.808719, climaTempoCod: 7717, climatTempoName: "RIO BRANCO" },
  // AL
  { uniorg: "14008", local: "PA ARAPIRACA-AL", address: "RD GO 222 SN K 40", city: "ARAPIRACA", state: "AL", latitude: -9.75220, longitude: -36.65938, climaTempoCod: 6404, climatTempoName: "ARAPIRACA" },
  // AM
  { uniorg: "11880", local: "ALEIXO-CAP-AM", address: "AV ANDRE ARAUJO 387", city: "MANAUS", state: "AM", latitude: -3.106111, longitude: -60.007365, climaTempoCod: 7544, climatTempoName: "MANAUS" },
  // AP
  { uniorg: "11877", local: "MACAPA-CENTRO", address: "R CANDIDO MENDES 1389", city: "MACAPA", state: "AP", latitude: 0.033874, longitude: -51.050268, climaTempoCod: 3982, climatTempoName: "MACAPA" },
  // BA
  { uniorg: "13191", local: "SELECT FEIRA DE SANTANA", address: "AV GETULIO VARGAS 768", city: "FEIRA DE SANTANA", state: "BA", latitude: -12.255732, longitude: -38.957925, climaTempoCod: 7554, climatTempoName: "FEIRA DE SANTANA" },
  { uniorg: "14023", local: "SELECT BAHIA INTERIOR", address: "PCA ESTEVAO SANTOS 180", city: "VITORIA DA CONQUISTA", state: "BA", latitude: -14.853908, longitude: -40.83765, climaTempoCod: 7568, climatTempoName: "VITORIA DA CONQUISTA" },
  // CE
  { uniorg: "14456", local: "CRATO-CE", address: "R DR MIGUEL LIMA VERDE 68", city: "CRATO", state: "CE", latitude: -7.233996, longitude: -39.412585, climaTempoCod: 5617, climatTempoName: "CRATO" },
  { uniorg: "11901", local: "PCA PORTUGAL-FORTALEZA-CE", address: "AV SANTOS DUMONT 2829", city: "FORTALEZA", state: "CE", latitude: -3.735968, longitude: -38.498618, climaTempoCod: 8050, climatTempoName: "FORTALEZA" },
  { uniorg: "12530", local: "SOBRAL-CE", address: "AV DOM JOSE TUPINAMBA DA FROTA 1281", city: "SOBRAL", state: "CE", latitude: -3.68887, longitude: -40.34848, climaTempoCod: 8154, climatTempoName: "SOBRAL" },
  // DF
  { uniorg: "12327", local: "PA SELECT ASA SUL-DF", address: "SHCS CR QUADRA 503 BL B SN LJ 53", city: "BRASILIA", state: "DF", latitude: -15.803169, longitude: -47.895748, climaTempoCod: 8173, climatTempoName: "BRASILIA" },
  // GO
  { uniorg: "14009", local: "SELECT CENTER SUL-GOIANIA", address: "AV D 20 QD D 11 LT 89 20", city: "GOIANIA", state: "GO", latitude: -16.690894, longitude: -49.262653, climaTempoCod: 6861, climatTempoName: "GOIANIA" },
  { uniorg: "14184", local: "SELECT RIO VERDE - GO", address: "AV PRESIDENTE VARGAS 925", city: "RIO VERDE", state: "GO", latitude: -17.792612, longitude: -50.927025, climaTempoCod: 6863, climatTempoName: "RIO VERDE" },
  { uniorg: "11985", local: "LUZIANIA-GO", address: "R BENJAMIN RORIZ QUADRA 33 SN LOTE 31", city: "LUZIANIA", state: "GO", latitude: -16.254452, longitude: -47.957464, climaTempoCod: 7538, climatTempoName: "LUZIANIA" },
  { uniorg: "12508", local: "VALPARAISO DE GOIAS-GO", address: "R 13 SN QD 33 LT 06", city: "VALPARAISO DE GOIAS", state: "GO", latitude: -16.073311, longitude: -47.981528, climaTempoCod: 5344, climatTempoName: "VALPARAISO DE GOIAS" },
  // MA
  { uniorg: "11806", local: "BACABAL-MA", address: "R GETULIO VARGAS 565 A", city: "BACABAL", state: "MA", latitude: -4.235057, longitude: -44.782121, climaTempoCod: 8395, climatTempoName: "BACABAL" },
  { uniorg: "11630", local: "BALSAS-MA", address: "R ANTONIO JACOBINA 240", city: "BALSAS", state: "MA", latitude: -7.531769, longitude: -46.039142, climaTempoCod: 8396, climatTempoName: "BALSAS" },
  { uniorg: "11847", local: "PA TIMON-MA", address: "AV FRANCISCO CARLOS JANSEN SN", city: "TIMON", state: "MA", latitude: -5.090984, longitude: -42.830822, climaTempoCod: 8517, climatTempoName: "TIMON" },
  // MS
  { uniorg: "14048", local: "DOURADOS", address: "AV DEP WEIMAR TORRES 1815", city: "DOURADOS", state: "MS", latitude: -22.226639, longitude: -54.812374, climaTempoCod: 6761, climatTempoName: "DOURADOS" },
  { uniorg: "11756", local: "PARANAIBA", address: "PCA DA REPUBLICA 89", city: "PARANAIBA", state: "MS", latitude: -19.677646, longitude: -51.190023, climaTempoCod: 7679, climatTempoName: "PARANAIBA" },
  { uniorg: "11666", local: "PONTA PORA-MS", address: "AV BRASIL 3247", city: "PONTA PORA", state: "MS", latitude: -22.535719, longitude: -55.729632, climaTempoCod: 9095, climatTempoName: "PONTA PORA" },
  { uniorg: "11984", local: "RIO BRILHANTE-MS", address: "R BENJAMIN CONSTANT 875", city: "RIO BRILHANTE", state: "MS", latitude: -21.803492, longitude: -54.542581, climaTempoCod: 9096, climatTempoName: "RIO BRILHANTE" },
  // MT
  { uniorg: "11593", local: "CENTRO-SAPEZAL-MT", address: "AV ROTARY INTERNACIONAL 759 SW QD 55 LT 6", city: "SAPEZAL", state: "MT", latitude: -13.546936, longitude: -58.815794, climaTempoCod: 3294, climatTempoName: "SAPEZAL" },
  { uniorg: "11986", local: "SELECT AGRO PRIMAVERA LESTE-MT", address: "AV AMAZONAS 423 SALA 5 Q 3 LT 10", city: "PRIMAVERA DO LESTE", state: "MT", latitude: -15.549213, longitude: -54.301964, climaTempoCod: 5377, climatTempoName: "PRIMAVERA DO LESTE" },
  { uniorg: "14058", local: "CENTRO-ALTA FLORESTA-MT", address: "AV LUDOVICO DA RIVA NETO 1952", city: "ALTA FLORESTA", state: "MT", latitude: -9.882779, longitude: -56.086442, climaTempoCod: 6765, climatTempoName: "ALTA FLORESTA" },
  { uniorg: "12275", local: "SORRISO-INT-MT", address: "AV NATALINO JOAO BRESCANSIN 144 QD 1 B LT 7", city: "SORRISO", state: "MT", latitude: -12.549751, longitude: -55.714689, climaTempoCod: 7687, climatTempoName: "SORRISO" },
  { uniorg: "13121", local: "CENTRO-TANGARA SERRA-MT", address: "R SAO PAULO 158 W 375 172 W", city: "TANGARA DA SERRA", state: "MT", latitude: -14.619064, longitude: -57.489261, climaTempoCod: 7688, climatTempoName: "TANGARA DA SERRA" },
  // PA
  { uniorg: "12086", local: "PA PARAGOMINAS-PA", address: "PCA CELIO MIRANDA 294", city: "PARAGOMINAS", state: "PA", latitude: 2.995279, longitude: -47.3556, climaTempoCod: 7481, climatTempoName: "PARAGOMINAS" },
  { uniorg: "10700", local: "PA REDENCAO-PA", address: "AV BRASIL SN QD 5 A LT 11", city: "REDENCAO", state: "PA", latitude: -8.033382, longitude: -50.024851, climaTempoCod: 7492, climatTempoName: "REDENCAO" },
  { uniorg: "11403", local: "SANTAREM", address: "AV RUI BARBOSA 607", city: "SANTAREM", state: "PA", latitude: -2.419646, longitude: -54.712266, climaTempoCod: 7506, climatTempoName: "SANTAREM" },
  { uniorg: "12470", local: "ABAETETUBA-PA", address: "R SIQUEIRA MENDES 1208 A", city: "ABAETETUBA", state: "PA", latitude: -1.726597, longitude: -48.890253, climaTempoCod: 7696, climatTempoName: "ABAETETUBA" },
  { uniorg: "13231", local: "PA BRAGANCA-PA", address: "R DR JUSTO CHERMONT SN QD 5 LT 243", city: "BRAGANCA", state: "PA", latitude: -1.056094, longitude: -46.764239, climaTempoCod: 7708, climatTempoName: "BRAGANCA" },
  { uniorg: "10955", local: "CENTRO-CANAA CARAJAS-PA", address: "AV WEYNE CAVALCANTE 431 QD 52 LT 23", city: "CANAA DOS CARAJAS", state: "PA", latitude: -6.525964, longitude: -49.852125, climaTempoCod: 9122, climatTempoName: "CANAA DOS CARAJAS" },
  { uniorg: "12511", local: "SELECT BELEM", address: "AV N SRA DE NAZARE 427", city: "BELEM", state: "PA", latitude: -1.45179, longitude: -48.48589, climaTempoCod: 7704, climatTempoName: "BELEM" },
  // PB
  { uniorg: "12411", local: "PATOS-PB", address: "AV SOLON DE LUCENA 2", city: "PATOS", state: "PB", latitude: -7.029175, longitude: -37.275919, climaTempoCod: 7399, climatTempoName: "PATOS" },
  { uniorg: "13029", local: "PA CABEDELO-PB", address: "R PASTOR JOSE ALVES DE OLIVEIRA 673", city: "CABEDELO", state: "PB", latitude: -6.979364, longitude: -34.830472, climaTempoCod: 7578, climatTempoName: "CABEDELO" },
  // PE
  { uniorg: "12419", local: "LIMOEIRO", address: "AV STO ANTONIO 194", city: "LIMOEIRO", state: "PE", latitude: -7.879215, longitude: -35.454526, climaTempoCod: 7109, climatTempoName: "LIMOEIRO" },
  { uniorg: "14375", local: "OURICURI", address: "R DESEMB MEDEIROS CORREIA SN", city: "OURICURI", state: "PE", latitude: -7.885701, longitude: -40.082543, climaTempoCod: 7122, climatTempoName: "OURICURI" },
  { uniorg: "12385", local: "PETROLINA", address: "AV SOUZA FILHO 195", city: "PETROLINA", state: "PE", latitude: -9.394849, longitude: -40.502087, climaTempoCod: 7133, climatTempoName: "PETROLINA" },
  { uniorg: "12106", local: "RECIFE-AV.CAXANGA", address: "AV CAXANGA 303", city: "RECIFE", state: "PE", latitude: -8.05538, longitude: -34.91196, climaTempoCod: 7140, climatTempoName: "RECIFE" },
  { uniorg: "12444", local: "SALGUEIRO", address: "R GUMERCINDO FILGUEIRA SAMPAIO 278", city: "SALGUEIRO", state: "PE", latitude: -8.073663, longitude: -39.119055, climaTempoCod: 7146, climatTempoName: "SALGUEIRO" },
  { uniorg: "14410", local: "SANTA MARIA DA BOA VISTA", address: "R MARQ DE OLINDA SN", city: "STA MARIA BOA VISTA", state: "PE", latitude: -8.808267, longitude: -39.821847, climaTempoCod: 7153, climatTempoName: "STA MARIA BOA VISTA" },
  { uniorg: "11589", local: "ARCOVERDE", address: "AV SEVERIANO JOSE FREIRE 421", city: "ARCOVERDE", state: "PE", latitude: -8.419587, longitude: -37.058413, climaTempoCod: 7259, climatTempoName: "ARCOVERDE" },
  { uniorg: "11153", local: "BELO JARDIM", address: "PCA DESEMB JOAO PAES SN", city: "BELO JARDIM", state: "PE", latitude: -8.336524, longitude: -36.424524, climaTempoCod: 7264, climatTempoName: "BELO JARDIM" },
  // PI
  { uniorg: "14046", local: "PICOS-PI", address: "AV GETULIO VARGAS 600", city: "PICOS", state: "PI", latitude: -7.081706, longitude: -41.46794, climaTempoCod: 6834, climatTempoName: "PICOS" },
  { uniorg: "12433", local: "R BARROSO-TERESINA-PI", address: "R ALVARO MENDES 1200", city: "TERESINA", state: "PI", latitude: -5.091187, longitude: -42.814407, climaTempoCod: 6951, climatTempoName: "TERESINA" },
  // RN
  { uniorg: "10100", local: "MOSSORO", address: "R CEL VICENTE SABOIA 17", city: "MOSSORO", state: "RN", latitude: -5.193232, longitude: -37.341158, climaTempoCod: 5863, climatTempoName: "MOSSORO" },
  { uniorg: "14010", local: "PONTA NEGRA-NATAL-RN", address: "AV ENG ROBERTO FREIRE 1436", city: "NATAL", state: "RN", latitude: -5.854442, longitude: -35.200802, climaTempoCod: 5864, climatTempoName: "NATAL" },
  { uniorg: "14054", local: "CAICO-RN", address: "AV CORONEL MARTINIANO 911", city: "CAICO", state: "RN", latitude: -6.462077, longitude: -37.094658, climaTempoCod: 6071, climatTempoName: "CAICO" },
  // RO
  { uniorg: "11575", local: "ARIQUEMES RO", address: "R FLORIANOPOLIS 2065", city: "ARIQUEMES", state: "RO", latitude: -9.913535, longitude: -63.046084, climaTempoCod: 5724, climatTempoName: "ARIQUEMES" },
  { uniorg: "12120", local: "JARU-RO", address: "R RIO DE JANEIRO 2910", city: "JARU", state: "RO", latitude: -10.441096, longitude: -62.467453, climaTempoCod: 5742, climatTempoName: "JARU" },
  { uniorg: "12246", local: "CENTRO-VILHENA-RO", address: "AV MAJ AMARANTE 2506", city: "VILHENA", state: "RO", latitude: -12.737684, longitude: -60.150471, climaTempoCod: 5772, climatTempoName: "VILHENA" },
  // SE
  { uniorg: "11054", local: "FCO PORTO-ARACAJU-SE", address: "AV FRANCISCO PORTO 902", city: "ARACAJU", state: "SE", latitude: -10.931911, longitude: -37.05831, climaTempoCod: 4502, climatTempoName: "ARACAJU" },
  { uniorg: "12347", local: "PA LAGARTO-SE", address: "PCA FILOMENO HORA 89", city: "LAGARTO", state: "SE", latitude: -10.916833, longitude: -37.670994, climaTempoCod: 4535, climatTempoName: "LAGARTO" },
  // TO
  { uniorg: "11961", local: "SELECT PALMAS", address: "AV JUSCELINO KUBITSCHEK 104 NORTE SN ACNE 1 CONJ 1", city: "PALMAS", state: "TO", latitude: -10.184184, longitude: -48.325139, climaTempoCod: 3427, climatTempoName: "PALMAS" },
];

export const getLocationByCode = (code: number): Location | undefined => {
  return locations.find(loc => loc.climaTempoCod === code);
};

export const getLocationsByState = (state: string): Location[] => {
  return locations.filter(loc => loc.state === state);
};

export const getAllStates = (): string[] => {
  return [...new Set(locations.map(loc => loc.state))].sort();
};

export const getTotalLocations = (): number => {
  return locations.length;
};
