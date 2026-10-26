import {
  IconBook, IconBox, IconBuildingBank, IconBuildingFactory, IconBuildingSkyscraper,
  IconCompass, IconCube, IconEye, IconFlask, IconHeartHandshake, IconLock,
  IconNetwork, IconPin, IconRocket, IconScale, IconSearch, IconShield,
  IconShieldLock, IconSquare, IconSwords, IconTools, IconWheel, IconWorld,
} from '@tabler/icons-react';

const icons = {
  book: IconBook,
  box: IconBox,
  buildingBank: IconBuildingBank,
  buildingFactory: IconBuildingFactory,
  buildingSkyscraper: IconBuildingSkyscraper,
  compass: IconCompass,
  cube: IconCube,
  eye: IconEye,
  flask: IconFlask,
  heartHandshake: IconHeartHandshake,
  lock: IconLock,
  network: IconNetwork,
  pin: IconPin,
  rocket: IconRocket,
  scale: IconScale,
  search: IconSearch,
  shield: IconShield,
  shieldLock: IconShieldLock,
  square: IconSquare,
  swords: IconSwords,
  tools: IconTools,
  wheel: IconWheel,
  world: IconWorld,
};

export default function CardIcon({name, size = 24}) {
  const Icon = icons[name];
  if (!Icon) throw new Error(`Unknown card icon: ${name}`);
  return <Icon aria-hidden="true" size={size} stroke={1.75} color="var(--ifm-color-content-secondary)" />;
}
