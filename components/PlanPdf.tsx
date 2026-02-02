"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { PlanDoc } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  h1: { fontSize: 18, marginBottom: 6, fontWeight: 700 },
  h2: { fontSize: 12, marginTop: 14, marginBottom: 6, fontWeight: 700 },
  small: { fontSize: 9, color: "#374151" },
  box: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  row: { display: "flex", flexDirection: "row", gap: 10 },
  col: { flexGrow: 1, flexBasis: 0 },
  label: { fontSize: 9, color: "#6B7280", marginBottom: 2 },
  value: { fontSize: 10 },
  bullet: { marginLeft: 10 },
  weekCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginTop: 10, marginBottom: 10 },
});

function v(x?: string | null) {
  const s = (x ?? "").trim();
  return s.length ? s : "Ikke oppgitt";
}

function bullets(text: string) {
  const lines = (text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return <Text style={styles.value}>Ikke oppgitt</Text>;
  return (
    <View>
      {lines.map((l, i) => (
        <Text key={i} style={[styles.value, styles.bullet]}>
          • {l.replace(/^•\s?/, "")}
        </Text>
      ))}
    </View>
  );
}

export function PlanPdf({ plan }: { plan: PlanDoc }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{v(plan.meta.title)}</Text>
        <Text style={styles.small}>
          Kandidat/gruppe: {v(plan.meta.ownerName)} • Oppdatert: {new Date(plan.meta.updatedAt).toLocaleString("nb-NO")}
        </Text>

        <Text style={styles.h2}>Kunde og prosjekt</Text>
        <View style={styles.box}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Kunde</Text>
              <Text style={styles.value}>{v(plan.customer.name)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Kontakt</Text>
              <Text style={styles.value}>{v(plan.customer.contact)}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Prosjektnavn</Text>
              <Text style={styles.value}>{v(plan.customer.projectName)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Deadline</Text>
              <Text style={styles.value}>{v(plan.customer.deadline)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Kundens ønsker (brief)</Text>
          {bullets(plan.customer.brief)}

          <Text style={[styles.label, { marginTop: 8 }]}>Suksesskriterier</Text>
          {bullets(plan.customer.successCriteria)}

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { marginTop: 8 }]}>Målgruppe</Text>
              <Text style={styles.value}>{v(plan.customer.targetAudience)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { marginTop: 8 }]}>Kanaler / flater</Text>
              <Text style={styles.value}>{v(plan.customer.channels)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.h2}>Konsept og strategi</Text>
        <View style={styles.box}>
          <Text style={styles.label}>Konsept</Text>
          {bullets(plan.strategy.concept)}
          <Text style={[styles.label, { marginTop: 8 }]}>Kjernebudskap</Text>
          {bullets(plan.strategy.keyMessage)}
          <Text style={[styles.label, { marginTop: 8 }]}>Tone og visuell stil</Text>
          {bullets(plan.strategy.toneAndStyle)}
          <Text style={[styles.label, { marginTop: 8 }]}>Hook-idéer</Text>
          {bullets(plan.strategy.hookIdeas)}
          <Text style={[styles.label, { marginTop: 8 }]}>Struktur</Text>
          {bullets(plan.strategy.structure)}
          <Text style={[styles.label, { marginTop: 8 }]}>Referanser</Text>
          {bullets(plan.strategy.references)}
        </View>

        <Text style={styles.h2}>Logistikk og avtaler</Text>
        <View style={styles.box}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Hovedlocation</Text>
              <Text style={styles.value}>{v(plan.logistics.mainLocation)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Rom / klasserom</Text>
              <Text style={styles.value}>{v(plan.logistics.classroomOrRoom)}</Text>
            </View>
          </View>
          <Text style={[styles.label, { marginTop: 8 }]}>Hvem må avklare filming med</Text>
          {bullets(plan.logistics.contactsToClear)}
          <Text style={[styles.label, { marginTop: 8 }]}>Medvirkende (lærer/talent)</Text>
          {bullets(plan.logistics.teachersOrTalent)}
          <Text style={[styles.label, { marginTop: 8 }]}>Assistenter / statister</Text>
          {bullets(plan.logistics.assistants)}
          <Text style={[styles.label, { marginTop: 8 }]}>Tillatelser</Text>
          {bullets(plan.logistics.permissions)}
        </View>

        <Text style={styles.h2}>Utstyr og tekniske sjekker</Text>
        <View style={styles.box}>
          <Text style={styles.label}>Tilgjengelig</Text>
          <Text style={styles.value}>
            {plan.equipment.available.iphone17ProMax ? "✓" : "–"} iPhone 17 Pro Max •{" "}
            {plan.equipment.available.djiMics ? "✓" : "–"} DJI mikrofoner •{" "}
            {plan.equipment.available.djiGimbal ? "✓" : "–"} DJI gimbal •{" "}
            {plan.equipment.available.mobileLight ? "✓" : "–"} Mobilt lys
          </Text>
          <Text style={[styles.label, { marginTop: 8 }]}>Ekstra å ta med</Text>
          {bullets(plan.equipment.extraToBring)}
          <Text style={[styles.label, { marginTop: 8 }]}>Preflight (før opptak)</Text>
          {bullets(plan.equipment.preflightChecks)}
        </View>

        <Text style={styles.h2}>Intervju, oppsett og B-roll</Text>
        <View style={styles.box}>
          <Text style={styles.label}>Intervjuguide</Text>
          {bullets(plan.interview.guide)}
          <Text style={[styles.label, { marginTop: 8 }]}>Spørsmål</Text>
          {bullets(plan.interview.questions)}
          <Text style={[styles.label, { marginTop: 8 }]}>Instruks til medvirkende</Text>
          {bullets(plan.interview.instructionsToTalent)}
          <Text style={[styles.label, { marginTop: 8 }]}>Kameraoppsett</Text>
          {bullets(plan.interview.cameraSetup)}
          <Text style={[styles.label, { marginTop: 8 }]}>B-roll-liste</Text>
          {bullets(plan.interview.brollList)}
        </View>

        <Text style={styles.h2}>Dokumentasjon</Text>
        <View style={styles.box}>
          <Text style={styles.label}>Loggplan</Text>
          {bullets(plan.documentation.logPlan)}
          <Text style={[styles.label, { marginTop: 8 }]}>Filstruktur</Text>
          {bullets(plan.documentation.fileStructure)}
          <Text style={[styles.label, { marginTop: 8 }]}>Navngiving</Text>
          {bullets(plan.documentation.namingConventions)}
          <Text style={[styles.label, { marginTop: 8 }]}>Backup</Text>
          {bullets(plan.documentation.backupPlan)}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Ukeplan frem til {v(plan.customer.deadline)}</Text>
        <Text style={styles.small}>
          Fyll ut i detalje: aktiviteter, avklaringer, Freepik-prompts/iterasjoner, shoot-dager, leveranser og risiko.
        </Text>

        {plan.weekly.map((w) => (
          <View key={w.id} style={styles.weekCard} wrap={false}>
            <Text style={{ fontSize: 11, fontWeight: 700 }}>{v(w.weekLabel)}</Text>
            <Text style={[styles.label, { marginTop: 6 }]}>Fokus</Text>
            {bullets(w.focus)}
            <Text style={[styles.label, { marginTop: 6 }]}>Kunde/avklaringer</Text>
            {bullets(w.customerTasks)}
            <Text style={[styles.label, { marginTop: 6 }]}>Produksjon/redigering</Text>
            {bullets(w.productionTasks)}
            <Text style={[styles.label, { marginTop: 6 }]}>Freepik – bilde</Text>
            {bullets(w.freepikImageTasks)}
            <Text style={[styles.label, { marginTop: 6 }]}>Freepik – video</Text>
            {bullets(w.freepikVideoTasks)}

            <Text style={[styles.label, { marginTop: 6 }]}>Shoot-dager</Text>
            {w.shootDays?.length ? (
              <View>
                {w.shootDays.map((sd, i) => (
                  <Text key={i} style={styles.value}>
                    • {v(sd.date)} • {v(sd.callTime)} • {v(sd.location)} • {v(sd.notes)}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.value}>Ikke oppgitt</Text>
            )}

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={[styles.label, { marginTop: 6 }]}>Leveranser</Text>
                {bullets(w.deliverables)}
              </View>
              <View style={styles.col}>
                <Text style={[styles.label, { marginTop: 6 }]}>Risiko/tiltak</Text>
                {bullets(w.risks)}
              </View>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
