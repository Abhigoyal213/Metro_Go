interface Station {
  id: string;
  name?: string;
  lineId?: string;
}

export function validateImportedStations(data: Station[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  data.forEach(station => {
    if (ids.has(station.id)) {
      errors.push(`Duplicate ID: ${station.id}`);
    }
    ids.add(station.id);

    if (!station.name || !station.lineId) {
      errors.push(`Missing fields in station: ${station.id}`);
    }
  });

  return errors;
}