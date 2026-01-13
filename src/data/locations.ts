// Location data extracted from the Excel file
export interface Location {
  uniorg: string;
  local: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  climaTempoCod: number;
  climatTempoName: string;
}

export const locations: Location[] = [
  { uniorg: "11593", local: "CENTRO-SAPEZAL-MT", city: "SAPEZAL", state: "MT", latitude: -13.546936, longitude: -58.815794, climaTempoCod: 3294, climatTempoName: "SAPEZAL" },
  { uniorg: "11961", local: "SELECT PALMAS", city: "PALMAS", state: "TO", latitude: -10.184184, longitude: -48.325139, climaTempoCod: 3427, climatTempoName: "PALMAS" },
  { uniorg: "11054", local: "FCO PORTO-ARACAJU-SE", city: "ARACAJU", state: "SE", latitude: -10.931911, longitude: -37.05831, climaTempoCod: 4502, climatTempoName: "ARACAJU" },
  { uniorg: "12347", local: "PA LAGARTO-SE", city: "LAGARTO", state: "SE", latitude: -10.916833, longitude: -37.670994, climaTempoCod: 4535, climatTempoName: "LAGARTO" },
  { uniorg: "12402", local: "CRUZEIRO DO SUL-AC", city: "CRUZEIRO DO SUL", state: "AC", latitude: -7.62179, longitude: -72.679181, climaTempoCod: 4908, climatTempoName: "CRUZEIRO DO SUL" },
  { uniorg: "11986", local: "SELECT AGRO PRIMAVERA LESTE-MT", city: "PRIMAVERA DO LESTE", state: "MT", latitude: -15.549213, longitude: -54.301964, climaTempoCod: 5377, climatTempoName: "PRIMAVERA DO LESTE" },
  { uniorg: "14456", local: "CRATO-CE", city: "CRATO", state: "CE", latitude: -7.233996, longitude: -39.412585, climaTempoCod: 5617, climatTempoName: "CRATO" },
  { uniorg: "11575", local: "ARIQUEMES RO", city: "ARIQUEMES", state: "RO", latitude: -9.913535, longitude: -63.046084, climaTempoCod: 5724, climatTempoName: "ARIQUEMES" },
  { uniorg: "12120", local: "JARU-RO", city: "JARU", state: "RO", latitude: -10.441096, longitude: -62.467453, climaTempoCod: 5742, climatTempoName: "JARU" },
  { uniorg: "12246", local: "CENTRO-VILHENA-RO", city: "VILHENA", state: "RO", latitude: -12.737684, longitude: -60.150471, climaTempoCod: 5772, climatTempoName: "VILHENA" },
  { uniorg: "10100", local: "MOSSORO", city: "MOSSORO", state: "RN", latitude: -5.193232, longitude: -37.341158, climaTempoCod: 5863, climatTempoName: "MOSSORO" },
  { uniorg: "14010", local: "PONTA NEGRA-NATAL-RN", city: "NATAL", state: "RN", latitude: -5.854442, longitude: -35.200802, climaTempoCod: 5864, climatTempoName: "NATAL" },
  { uniorg: "14054", local: "CAICO-RN", city: "CAICO", state: "RN", latitude: -6.462077, longitude: -37.094658, climaTempoCod: 6071, climatTempoName: "CAICO" },
  { uniorg: "14008", local: "PA ARAPIRACA-AL", city: "ARAPIRACA", state: "AL", latitude: -9.75220, longitude: -36.65938, climaTempoCod: 6404, climatTempoName: "ARAPIRACA" },
  { uniorg: "14048", local: "DOURADOS", city: "DOURADOS", state: "MS", latitude: -22.226639, longitude: -54.812374, climaTempoCod: 6761, climatTempoName: "DOURADOS" },
  { uniorg: "14058", local: "CENTRO-ALTA FLORESTA-MT", city: "ALTA FLORESTA", state: "MT", latitude: -9.882779, longitude: -56.086442, climaTempoCod: 6765, climatTempoName: "ALTA FLORESTA" },
  { uniorg: "14046", local: "PICOS-PI", city: "PICOS", state: "PI", latitude: -7.081706, longitude: -41.46794, climaTempoCod: 6834, climatTempoName: "PICOS" },
  { uniorg: "14009", local: "SELECT CENTER SUL-GOIANIA", city: "GOIANIA", state: "GO", latitude: -16.690894, longitude: -49.262653, climaTempoCod: 6861, climatTempoName: "GOIANIA" },
  { uniorg: "14184", local: "SELECT RIO VERDE - GO", city: "RIO VERDE", state: "GO", latitude: -17.792612, longitude: -50.927025, climaTempoCod: 6863, climatTempoName: "RIO VERDE" },
  { uniorg: "12433", local: "R BARROSO-TERESINA-PI", city: "TERESINA", state: "PI", latitude: -5.091187, longitude: -42.814407, climaTempoCod: 6951, climatTempoName: "TERESINA" },
  { uniorg: "12419", local: "LIMOEIRO", city: "LIMOEIRO", state: "PE", latitude: -7.879215, longitude: -35.454526, climaTempoCod: 7109, climatTempoName: "LIMOEIRO" },
  { uniorg: "14375", local: "OURICURI", city: "OURICURI", state: "PE", latitude: -7.885701, longitude: -40.082543, climaTempoCod: 7122, climatTempoName: "OURICURI" },
  { uniorg: "12385", local: "PETROLINA", city: "PETROLINA", state: "PE", latitude: -9.394849, longitude: -40.502087, climaTempoCod: 7133, climatTempoName: "PETROLINA" },
  { uniorg: "12106", local: "RECIFE-AV.CAXANGA", city: "RECIFE", state: "PE", latitude: -8.05538, longitude: -34.91196, climaTempoCod: 7140, climatTempoName: "RECIFE" },
  { uniorg: "12444", local: "SALGUEIRO", city: "SALGUEIRO", state: "PE", latitude: -8.073663, longitude: -39.119055, climaTempoCod: 7146, climatTempoName: "SALGUEIRO" },
  { uniorg: "11589", local: "ARCOVERDE", city: "ARCOVERDE", state: "PE", latitude: -8.419587, longitude: -37.058413, climaTempoCod: 7259, climatTempoName: "ARCOVERDE" },
  { uniorg: "11153", local: "BELO JARDIM", city: "BELO JARDIM", state: "PE", latitude: -8.336524, longitude: -36.424524, climaTempoCod: 7264, climatTempoName: "BELO JARDIM" },
  { uniorg: "12411", local: "PATOS-PB", city: "PATOS", state: "PB", latitude: -7.029175, longitude: -37.275919, climaTempoCod: 7399, climatTempoName: "PATOS" },
  { uniorg: "12086", local: "PA PARAGOMINAS-PA", city: "PARAGOMINAS", state: "PA", latitude: 2.995279, longitude: -47.3556, climaTempoCod: 7481, climatTempoName: "PARAGOMINAS" },
  { uniorg: "10700", local: "PA REDENCAO-PA", city: "REDENCAO", state: "PA", latitude: -8.033382, longitude: -50.024851, climaTempoCod: 7492, climatTempoName: "REDENCAO" },
  { uniorg: "11403", local: "SANTAREM", city: "SANTAREM", state: "PA", latitude: -2.419646, longitude: -54.712266, climaTempoCod: 7506, climatTempoName: "SANTAREM" },
  { uniorg: "11880", local: "ALEIXO-CAP-AM", city: "MANAUS", state: "AM", latitude: -3.106111, longitude: -60.007365, climaTempoCod: 7544, climatTempoName: "MANAUS" },
  { uniorg: "13191", local: "SELECT FEIRA DE SANTANA", city: "FEIRA DE SANTANA", state: "BA", latitude: -12.255732, longitude: -38.957925, climaTempoCod: 7554, climatTempoName: "FEIRA DE SANTANA" },
  { uniorg: "14023", local: "SELECT BAHIA INTERIOR", city: "VITORIA DA CONQUISTA", state: "BA", latitude: -14.853908, longitude: -40.83765, climaTempoCod: 7568, climatTempoName: "VITORIA DA CONQUISTA" },
  { uniorg: "13029", local: "PA CABEDELO-PB", city: "CABEDELO", state: "PB", latitude: -6.979364, longitude: -34.830472, climaTempoCod: 7578, climatTempoName: "CABEDELO" },
  { uniorg: "11756", local: "PARANAIBA", city: "PARANAIBA", state: "MS", latitude: -19.677646, longitude: -51.190023, climaTempoCod: 7679, climatTempoName: "PARANAIBA" },
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
