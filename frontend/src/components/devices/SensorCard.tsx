import type { HomeAssistantEntity } from "../../features/devices/types";

interface SensorCardProps {
  entity: HomeAssistantEntity;
}

export default function SensorCard({
  entity
}: SensorCardProps) {
  const unit = entity.attributes?.unit_of_measurement ?? "";

  return (
    <article>
      <h3>{entity.attributes?.friendly_name ?? entity.entity_id}</h3>
      <strong>{entity.state}{unit}</strong>
    </article>
  )
}