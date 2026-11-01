import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const FIELDS = [
  ["Role", "role"], ["Age", "age"], ["Gender", "gender"], ["Sexual Orientation", "sexual_orientation"],
  ["Occupation", "occupation"], ["Hobbies", "hobbies"], ["Description", "description"], ["Backstory", "backstory"],
  ["Education", "education"], ["Skills", "skills"], ["Special Training", "special_training"], ["Appearance", "appearance"],
];

const PHOTOS = [["Headshot", "headshot"], ["Full Body", "full_body"], ["Professional", "professional"], ["Casual", "casual"]];

export default function CharacterPrintButton({ char, bookTitle }) {
  const print = () => {
    const set = char.photo_set || {};
    const photos = PHOTOS.filter(([, k]) => set[k]);
    const main = char.identity_image_url || (char.images || [])[0];
    const rows = FIELDS.filter(([, k]) => char[k]).map(([l, k]) => `<tr><th>${l}</th><td>${esc(char[k])}</td></tr>`).join("");
    const traits = char.traits?.length ? `<tr><th>Traits</th><td>${esc(char.traits.join(", "))}</td></tr>` : "";
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>${esc(char.name || "Character")}</title><style>
      body{font-family:Georgia,serif;color:#111;max-width:780px;margin:32px auto;padding:0 24px}
      h1{margin:0}.sub{color:#666;margin:4px 0 20px}.top{display:flex;gap:20px;align-items:flex-start}
      .main{width:220px;border-radius:8px}table{border-collapse:collapse;width:100%;font-size:14px}
      th{text-align:left;vertical-align:top;padding:6px 10px 6px 0;width:140px;color:#555}td{padding:6px 0;white-space:pre-wrap}
      tr{border-bottom:1px solid #eee}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:20px}
      .grid img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:6px}.grid p{text-align:center;font-size:12px;margin:4px 0}
      @media print{body{margin:0}}</style></head><body>
      <h1>${esc(char.name || "Unnamed Character")}</h1><p class="sub">${esc(bookTitle || "")}</p>
      <div class="top">${main ? `<img class="main" src="${esc(main)}"/>` : ""}<table>${rows}${traits}</table></div>
      ${photos.length ? `<div class="grid">${photos.map(([l, k]) => `<div><img src="${esc(set[k])}"/><p>${l}</p></div>`).join("")}</div>` : ""}
      <script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
    w.document.close();
  };

  return (
    <Button size="sm" variant="outline" onClick={print} className="border-white/20 text-white hover:bg-white/10" title="Print / save as PDF">
      <Printer className="w-3 h-3" />
    </Button>
  );
}