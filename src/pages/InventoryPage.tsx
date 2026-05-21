const rows = [
  { serial: 'F2401DH90004065', model: 'NEXXT GPON', sap: '100456', status: 'giacente' },
  { serial: 'CP2518JETCA', model: 'NEXXT SEVEN GPON', sap: '100693', status: 'assegnato' },
  { serial: 'R19100000092737', model: 'VDF Wifi 5', sap: 'VDF5', status: 'installato' }
];

export function InventoryPage() {
  return (
    <section>
      <h2>Seriali modem</h2>
      <p>Prossimo step: collegare tabella a Supabase e abilitare scanner barcode/QR mobile.</p>
      <table>
        <thead>
          <tr>
            <th>Seriale</th>
            <th>Modello</th>
            <th>SAP</th>
            <th>Stato</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.serial}>
              <td>{row.serial}</td>
              <td>{row.model}</td>
              <td>{row.sap}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
