const NS="http://www.w3.org/2000/svg";
const shapes={
 programming:["M8 8 4 12l4 4","M16 8l4 4-4 4","M14 4l-4 16"],
 images:["M4 4h16v16H4z","M8 10a2 2 0 1 0 0.1 0","M4 17l5-5 4 4 3-3 4 4"],
 video:["M3 5h13v14H3z","M16 10l5-3v10l-5-3z","M9 9l4 3-4 3z"],
 marketing:["M3 10v4h4l10 5V5L7 10z","M7 14l2 6","M20 9v6"],
 business:["M4 7h16v14H4z","M9 7V4h6v3","M4 13h16","M10 13v2h4v-2"],
 legal:["M12 3v18","M5 7h14","M5 7l-3 6h6z","M19 7l-3 6h6z","M7 21h10"],
 education:["M3 8l9-5 9 5-9 5z","M6 10v7c3 2 9 2 12 0v-7","M21 8v8"],
 security:["M12 2l8 4v6c0 6-4 9-8 10-4-1-8-4-8-10V6z","M8 12l3 3 5-6"],
 agents:["M12 3v3","M9 3h6","M4 7h16v13H4z","M8 12h1","M15 12h1","M9 16h6"],
 writing:["M4 20l5-.8L20 8 16 4 5 15z","M14 6l4 4","M4 20h16"],
 research:["M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z","M16.5 16.5L21 21"],
 commerce:["M3 4h2l3 12h11l2-9H6","M9 21h.01","M18 21h.01"]
};
export function categoryIcon(category){
 const svg=document.createElementNS(NS,"svg");
 svg.setAttribute("viewBox","0 0 24 24");
 svg.setAttribute("width","24");svg.setAttribute("height","24");
 svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");
 svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
 svg.setAttribute("stroke-width","1.8");svg.setAttribute("stroke-linecap","round");
 svg.setAttribute("stroke-linejoin","round");
 for(const d of shapes[category]||shapes.research){
  const p=document.createElementNS(NS,"path");
  p.setAttribute("d",d);svg.append(p);
 }
 return svg;
}
