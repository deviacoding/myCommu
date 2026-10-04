/**
 * Génère un PDF par guide dans public/pdf/<slug>.pdf à partir de content/guides.
 * Une page de couverture, puis une page par étape (numéro, titre, texte, conseil, capture).
 * Lancement : npm run pdf (aussi exécuté avant npm run build).
 */
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { guides } from "../content/guides";
import type { Guide, GuideStep } from "../content/guides/types";

// @react-pdf/renderer est un module ESM : chargé dynamiquement pour que le script tourne aussi en CommonJS.
type Pdf = typeof import("@react-pdf/renderer");
let Document: Pdf["Document"], Page: Pdf["Page"], Text: Pdf["Text"], View: Pdf["View"], Image: Pdf["Image"];
let styles: ReturnType<Pdf["StyleSheet"]["create"]>;

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "pdf");
const SITE_URL = "https://mycommu-site.web.app";

const NIGHT = "#0f1f3d";
const GOLD = "#b8902e";
const GOLD_FAINT = "#fbf3dc";
const MUTED = "#5b6478";
const CREAM = "#faf6ee";

// Les polices standard (Helvetica) couvrent le Latin-1 : on remplace les rares caractères hors de ce jeu.
const clean = (s: string) => s.replace(/→/g, "->").replace(/←/g, "<-").replace(/[^\u0000-ÿŒœ‘’“”…–—•]/g, "");

const makeStyles = (StyleSheet: Pdf["StyleSheet"]) => StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 11.5, color: "#14213d", backgroundColor: "#ffffff", padding: 40 },
  cover: { fontFamily: "Helvetica", color: "#ffffff", backgroundColor: NIGHT, padding: 48, justifyContent: "space-between" },
  eyebrow: { fontSize: 9, color: GOLD, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "Helvetica-Bold" },
  h1: { fontSize: 30, fontFamily: "Helvetica-Bold", marginTop: 10, lineHeight: 1.15 },
  intro: { fontSize: 12.5, marginTop: 14, lineHeight: 1.5, color: "#dfe4f0" },
  toc: { marginTop: 24 },
  tocItem: { fontSize: 11, marginTop: 4, color: "#eef1f8" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8.5, color: MUTED },
  row: { flexDirection: "row", gap: 24, marginTop: 14 },
  col: { flex: 1 },
  stepNo: { fontSize: 9, color: GOLD, letterSpacing: 1.5, fontFamily: "Helvetica-Bold" },
  h2: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 6, lineHeight: 1.2 },
  body: { marginTop: 12, lineHeight: 1.55 },
  tip: { marginTop: 14, backgroundColor: GOLD_FAINT, borderLeftWidth: 3, borderLeftColor: GOLD, padding: 10, lineHeight: 1.5, fontSize: 10.5 },
  tipLabel: { fontFamily: "Helvetica-Bold", color: GOLD },
  shot: { width: 190, borderRadius: 14, borderWidth: 3, borderColor: NIGHT },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#e6dfd0", paddingBottom: 8, fontSize: 9, color: MUTED },
  badge: { backgroundColor: CREAM, color: NIGHT, fontSize: 9, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, alignSelf: "flex-start", fontFamily: "Helvetica-Bold" },
});

function StepPage({ step, index, total, guide }: { step: GuideStep; index: number; total: number; guide: Guide }) {
  const img = step.image ? path.join(ROOT, "public", step.image) : null;
  const hasImg = !!img && fs.existsSync(img);
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>myCommu · {clean(guide.title)}</Text>
        <Text>
          Étape {index + 1} / {total}
        </Text>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.stepNo}>ÉTAPE {index + 1}</Text>
          <Text style={styles.h2}>{clean(step.title)}</Text>
          <Text style={styles.body}>{clean(step.text)}</Text>
          {step.tip ? (
            <Text style={styles.tip}>
              <Text style={styles.tipLabel}>Conseil · </Text>
              {clean(step.tip)}
            </Text>
          ) : null}
        </View>
        {hasImg ? (
          <View>
            <Image src={{ data: fs.readFileSync(img!), format: "jpg" }} style={styles.shot} />
          </View>
        ) : null}
      </View>
      <View style={styles.footer} fixed>
        <Text>
          {SITE_URL}/apprendre/{guide.slug}
        </Text>
        <Text>
          {index + 1} / {total}
        </Text>
      </View>
    </Page>
  );
}

function GuideDoc({ guide }: { guide: Guide }) {
  return (
    <Document title={guide.title} author="myCommu" subject={guide.intro} language="fr">
      <Page size="A4" style={styles.cover}>
        <View>
          <Text style={styles.eyebrow}>myCommu · guide {clean(guide.audience).toLowerCase()}</Text>
          <Text style={styles.h1}>{clean(guide.title)}</Text>
          <Text style={styles.intro}>{clean(guide.intro)}</Text>
          <View style={styles.toc}>
            <Text style={[styles.eyebrow, { marginBottom: 6 }]}>Les étapes</Text>
            {guide.steps.map((s, i) => (
              <Text key={s.title} style={styles.tocItem}>
                {i + 1}. {clean(s.title)}
              </Text>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 9, color: "#c9d0e0" }}>
          <Text>
            {guide.steps.length} étapes{guide.duration ? ` · ${clean(guide.duration)}` : ""}
          </Text>
          <Text>{SITE_URL}</Text>
        </View>
      </Page>
      {guide.steps.map((s, i) => (
        <StepPage key={s.title} step={s} index={i} total={guide.steps.length} guide={guide} />
      ))}
    </Document>
  );
}

async function main() {
  const pdf = await import("@react-pdf/renderer");
  ({ Document, Page, Text, View, Image } = pdf);
  styles = makeStyles(pdf.StyleSheet);
  const { renderToFile } = pdf;
  fs.mkdirSync(OUT, { recursive: true });
  for (const g of guides) {
    const file = path.join(OUT, `${g.slug}.pdf`);
    await renderToFile(<GuideDoc guide={g} />, file);
    console.log("PDF :", path.relative(ROOT, file), `(${g.steps.length} étapes)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
