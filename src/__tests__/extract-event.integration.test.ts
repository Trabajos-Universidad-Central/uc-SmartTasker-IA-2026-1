// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

// ═══════════════════════════════════════════════════════════════
//  TEST DE INTEGRACIÓN REAL — API Gemini + extract-event route
//  Mide latencia real de respuesta con la API de producción
// ═══════════════════════════════════════════════════════════════

const MAX_LATENCY_MS = Number(
  process.env.EXTRACT_EVENT_MAX_LATENCY_MS ?? "20000",
);
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

// ─── Mock de next/server (no existe en Node puro) ───────────────
vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: (body: any, init?: { status?: number }) => ({
      data: body,
      status: init?.status ?? 200,
    }),
  },
}));

// ─── Mock de Supabase (simula usuario autenticado) ──────────────
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: { id: "integration-test-user" } } }),
      ),
    },
  })),
}));

// ─── Imagen PNG real (640×200, texto negro sobre blanco) ────────
// Gemini requiere PNG/JPEG, NO acepta SVG
const TEST_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAoAAAADICAIAAAD3O8dcAAAX+UlEQVR4nO3cf0zU9x3H8Q9UOX5o77aIgoJNoGsWi4WqwwrccfgD2BkUXWusUvnVLcTp0qzx11z1j27DmlUznT9mHbVoDZsoMVE0rLYF54I/siU1RLbyQ3QoUhkcoN5V4LM/vuk35O57FDncx7XPx1/f+3w/P96fzxlf+X4RA6SUAgAA/G8Fqi4AAIBvIwIYAAAFCGAAABQggAEAUIAABgBAAQIYAAAFCGAAABQggAEAUIAABgBAAQIYAAAFCGAAABQggAEAUIAABgBAAQIYAAAFCGAAABQggAEAUIAABgBAAQIYAAAFCGAAABQggAEAUIAABgBAAX8DODQ01P6VHTt2jHiebdu2DXOt1NTUGTNmVFdXj3gtIURdXd2+fftGPNxisQzdQSs1LS0tJSXl8uXLozXtYEOf2N///vf09PS0tLQFCxbcvHlz+NMarlJRUaF9xWPGjNEuysvLhxj1SBsBgG+nACmlP+MtFktXV5f/dQxnHr3P1atXV65c+dlnn/m/7sh8bbWDSy0oKBhmBj/SYQ7dOSEh4dSpU1FRUcePH//zn//8pz/9aZjTDr3KMCscrT8VAPANNsqvoBMSElpbW4UQbrf7ueee6+joyMnJmT9/vs1mu3TpktbHYrFs3rw5NTU1Pj6+oqJCCLF169be3t709PS2tjaHw2Gz2RwOR1tbW0ZGhuEqcXFxra2tnZ2dhpPr3fRr7xX1ux4r+uoshLhz586iRYusVmteXp7WYliAh+nTpzc3N2vT5ufn79q1y2NF72kNd3H37t2lS5fa7fb09PT29nZfJ6aPam9vd7lcQohFixatWbNGm6egoCA2Nnb//v05OTkxMTE7d+4UQtTV1aWkpMTFxWkfB5eqr+K9L49Ru3fvfvHFF2fMmFFVVTW4hhdeeKGurs7XN6WtYnhuAPDNJ/1jNpsHf3z77bf37t0rpTxz5szatWsLCwtra2ullC0tLfHx8VqfkJCQHTt2SCkbGxujo6MHz7NixYrS0lIpZWlp6cqVK7u7uw3XOnv27Msvv2w4+eB69Ovhr+irs5QyJyfnyJEjUsqKigqTySSlNCzAY+mPPvpo3rx5Usrg4OCzZ896r+g9reEuVq1adfToUSllSUlJUVHREPVr3n///YiIiIKCgo8//lhrMZlMtbW1LS0tAQEBFy9evH79emRkpJSyqKiopqamo6ND+zi4VOn1/eofPUaFh4d3d3dfu3bttdde07q53e60tLRz5875OqjBqwDAt5C/ARwSEpL6lb/97W/19fUZGRlSytWrV58/fz4qKkq/++yzz/b19UkpTSZTZ2enNvzpp5/WLrS/2SdPnuxyuaSULpdr8uTJhmslJSV997vfvX37tuHkgwNj/Pjx2sUjrWjYWUoZFRWl9Xz48GFoaKjW4l3A4FJtNltWVlZzc7OUMiwsrL+/33tF72kNdzFlyhS32y2l7Ovr6+rqGs6J/ec//ykpKXnhhRe2bt2qlaSfv1aJNkN3d/eBAwfWr18fFhamDdRLlb4D2GNUbm5udnZ2VVWV3u31118/ePCgfnTeBzV4FQD4FhrlJ2Ap5axZs5xO55w5cwYGBiIiIh48eCCl7O/vr66u1jrouTh4uHYRGRk5RADrnd95553i4uKhJ+/s7NQfKB9pRcPOUsqJEydqPd1ud0hIiJTSsABfx6K3eKzoPa3hLiIiIrRuHhManlh7e/uFCxf060mTJnlvXL/IyMg4cODAzZs39UUN3yJ4fPQeVV1dvWTJkry8PCllcHDwSy+99Prrr2u3DA/K+4gA4Ftl9H8NafHixdu2bUtMTAwICEhOTtZ+jHrmzJni4mKtQ2CgwaIDAwMDAwNpaWnaP68tLy+32+29vb2GSyxYsODSpUuGk5vN5rq6OiHEhx9+GBAQMMSKGo8Vh+iclJR08uRJIURFRYWUUghhWMDX8ljRe1rDXSQmJmrdDh48uGnTJl8npg0PCAhYtmyZ9o+fOzo6pk6dOkQ9V65cWbZsmcvlcrvd3ne1VYYe5XQ6U1NT58yZc/jw4crKSiGEyWS6cOHC9evX33vvvREfFAB8w/kZ4INfQW/cuFFKWV9fHxQUpD2B3bhxIzMz02azzZ07t7GxURti+IDlcDgWLlzY2tqamZlptVozMzNv3bq1YMGCwWvpne/duxcbG3v9+nXvyU+cODFt2jS73b5+/XrvZz7p9fznsaKvzlLKpqYmq9VqtVo3bNigtRvuznugR4vHit7TGu6ioaFBf6etvSE3PDF9udOnT8+ePdtut8+bN+/q1aveG9cv3nrrrWnTpr366qv6s/jg4rVVvHfhMWr79u0zZsxISEjYvXu33q29vT0mJubixYtf+8cAAL6F/P01JAAAMAL8T1gAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAK+BvAoaGh9q/s2LFjOEMsFssjLVFSUmK1WhMSEqqqqoQQf/nLX2JiYrQVf/nLX/q5hNazrq5u37593nd9tQ9z2kflsVOn05mdnZ2SkpKdne10Og37DAwM/OxnP5szZ47NZmtqahrBogAANaR/zGbzYx3S3t5us9n6+/uvXbv2/e9/X0pZWlq6b9++0VpiBPU/pmm9d7pu3bp3331XSvnb3/52w4YNhn327Nnzi1/8Qkp54sSJJUuWjO4uAACPzyi/gu7s7MzJyZk/f77NZrt06ZIQ4u7du0uXLrXb7enp6e3t7Vq3zZs3p6amTp8+vaKiQghRV1eXkpISFxe3c+dOIURGRoY+YUdHx5o1awIDA6Ojozs6OoQQt2/fjoyM9F76zp07ixYtslqteXl5vorx1VN89czqXa3WbjiVxWIpKCiIjY3dv39/Tk5OTEyMVr9m3bp1VqvVZrM1NzdrnfPz83ft2uWrKu+dVlZWLl++XAixfPny06dPG/b58MMP8/PzhRALFy586aWXHv0bAwAo4meAezzqFRYW1tbWSilbWlri4+OllKtWrTp69KiUsqSkpKioSEoZHBy8Y8cOKeU///nP6OhoKWVRUVFNTU1HR0dkZKSUsru723uhQ4cOFRQUSCnfeOONH//4x8nJyVlZWQ0NDXqHnJycI0eOSCkrKipMJpNhMb566hvxrlZrN5zKZDLV1ta2tLQEBARcvHjx+vXrWv3aHsvKyqSUhw8fzs7O1lrOnj07RFXeO50wYUJ/f7+Usr+/Pzw83Fefd999NzU1NTs7u7m52egrAgA8iQKklP7kd2hoaGJionb9hz/8Yf78+bGxsdrH1tbW+vr6Z555pqmpKSgoqL+/v7e312w2BwcHt7W1aU+WZrPZ6XT29PSUlZU1NDTs2bOnt7fXe5XGxsbFixd/8skn4eHhP//5z2NjY3/605+eOHHi97///ccff6z1iY6ObmhoMJlMfX19ZrP53r170dHRHsU89dRThj2FEBaLpaurKyoqyqNard1wqtDQ0J6enqeeeio4OPj+/fuBgYFaZ+1Yurq6goKC3G73M88809bWNm7cuO7ubu3h1bAq752Gh4ffuXMnMDBwYGAgIiJCf38wuI/ZbC4pKfnRj350/PjxvXv3njt3zp9vEwDwv+NngHs8AUdERDx48EBK2d/fX11drbW4XK7BfcaPH+8xPCMj48CBAzdv3hx8S9fT0zNz5kztqVFK2dzc3NfXJ6Xs6+ubMGGC3m3ixInaQm63OyQkxLAYXz31Sryr1du9p9L37n0RFhamFelyuaZOnTr4lq+qvHf6/PPPt7a2Sin//e9/x8XFGfb53ve+Z3gaAIAn3Cj/DDg5OVn7se6ZM2eKi4uFEImJiSdPnhRCHDx4cNOmTUKIwEDPRa9cubJs2TKXy+V2u4UQgx+CpZS5ublvvvnm7NmztZaNGzeeOnVKCHHx4sXp06frPZOSkrSFKioqpJSGxfjqqfOu1te+htbX11dZWSmEOHbsWFpa2tBH5GunDoejrKxMCFFWVuZwOAz7zJ07t6amRghRU1MTHx//tYUBAJ4Q/r6C1l+6am7evPmTn/zk/v37Y8aMee+992JiYhobGwsLC6WUZrO5tLTUYrEMHqJdb9my5fjx4/Hx8efOnbtx40ZWVpb2OzZCiPfff3/t2rWzZs0SQowbN+7UqVOff/55fn7+mDFjgoOD9+zZo7/ObW5uzs3NFUIkJSXt37+/q6vLuxhfPfVKfFVrOJW+EcOL7OzspqYmi8Xyxz/+MTw8XL/lqyrvnTqdztzc3Lt3706YMOGDDz4wm83efdrb2wsLC3t7e8eMGbN//379NAAATzh/AxgAAIwA/xMWAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAv4GsMViGeLjo+rq6srLyzObzR7tlZWVISEh+ken05mdnZ2SkpKdne10Og1bAAB4kj1ZT8BZWVkzZ84MCAgY3NjT0/OrX/1q7Nixesuvf/1rm83217/+1Wq1FhcXG7YAAPAkeywB3NbW5nA4bDabw+Foa2sTQlgslvz8/F27dtXV1aWkpMTFxe3cuVMIkZGRMXjgsWPH1q5d6zHbxo0b33jjjcDAQL1/ZWXl8uXLhRDLly8/ffq0YQsAAE806R+z2ez9ccWKFaWlpVLK0tLSlStXSimDg4PPnj0rpSwqKqqpqeno6IiMjJRSdnd3Dz3n+fPns7Oz9Uat/4QJE/r7+6WU/f394eHhhi0AADzJAqSU/uR3aGhoYmKi/vHSpUv379+fMmVKU1OTyWRyu90xMTGtra3jxo3r7u4ODAzs6ekpKytraGjYs2dPb2+v4ZwWi6Wrq0sI4Xa7U1NTT5w4MXnyZL1RCBEeHn7nzp3AwMCBgYGIiIj29nbvFn82BQDA4+bvK+igoKBPBwkKChJCeIf6mDFjtHfIr7zyihBi7dq12sehHT9+vKenZ8WKFXa7vbe3d9WqVVr7pEmTtDfbt2/fnjRpkmELAABPssfyM+C0tLTy8nIhRHl5ud1uH3zrypUry5Ytc7lcbrdbCOHrIVizYsWKuro6LdrHjRtXWlqq9Xc4HGVlZUKIsrIyh8Nh2AIAwJPM31fQg98M6x9v3bpVWFh47969sLCwkpKSyMhIvduWLVuOHz8eHx9/7ty5GzduZGVlVVVVDT3n4Mb09PSqqiqn05mbm3v37t0JEyZ88MEHZrPZu8WfTQEA8Lj5G8AAAGAEnqzfAwYA4FuCAAYAQAECGAAABQhgAAAUIIABAFCAAAYAQAECGAAABQhgAAAUIIABAFCAAAYAQAECGAAABQhgAAAUIIABAFCAAAYAQAECGAAABQhgAAAUIIABAFCAAAYAQAECGAAABQhgAAAUIIABAFCAAAYAQAECGAAABQhgAAAUIIABAFCAAAYAQAECGAAABQhgAAAUIIABAFCAAAYAQAECGAAABQhgAAAUIIABAFCAAAYAQAECGAAABQjgEaqvr3/nnXecTqfqQgAA/5f8DeDQ0FC73Z6WlpacnHzo0CF/pqqrq9u3b9/o9vSmF5ySknL58mUhhMViGUGFS5YsCQkJ+fzzz0dQiT/1iyEL9rg1/K35YwTb2bZt2/A7l5SUWK3WhISEqqqqRywNAJ5cAVJKf8ZbLJauri4hxL179xYtWlRUVPTKK6+MTmmPh17w1atXCwoKLl++rLc8ku985zudnZ2jXt5wDFGwx62Rbe1/YPiFffHFFy+//PInn3zyr3/9a8mSJdeuXXvMpQHA/8iovYIOCwvbvn377373u87OzpycnPnz59tstkuXLgkhdu/e/eKLL86YMaOqquru3btLly612+3p6ent7e1CCIvFkp+fv2vXLjHoic1isaxbt85qtdpstubmZsNRQoi2tjaHw2Gz2RwOR1tbm9a+efPm1NTU+Pj4iooKIURGRoZhwdOnT29ubtY/1tXVpaSkxMXF7dy5U6/BYyp93X379vX09Njt9t7eXq3Fo0KP2fypX3Pnzp1FixZZrda8vDytxfucfRnm1lavXm2321NSUsaOHetrVEFBQWxs7P79+3NycmJiYgbf8lWS91pbt27t7e1NT0/33r4QIiEhobW1VQjhdrufe+65L774Ys2aNYGBgdHR0R0dHUNsEwD+z0j/mM1m/frLL7+cNGlSYWFhbW2tlLKlpSU+Pl5KGR4e3t3dfe3atddee23VqlVHjx6VUpaUlBQVFUkpg4ODz5496zFbcHBwWVmZlPLw4cPZ2dneo7SeK1asKC0tlVKWlpauXLlSShkSErJjxw4pZWNjY3R0tJSyu7vbsOCPPvpo3rx5ektRUVFNTU1HR0dkZKTWwXuqwcM9Ljwq9JjNn/o1OTk5R44ckVJWVFSYTCYppfc5e3wdj7o1zdtvv71lyxbDUSaTqba2tqWlJSAg4OLFi9evX9dvaQsZljTEMXpvXytg7969UsozZ86sXbtWL+zQoUMFBQUSAL4pRjOA79+/HxUVFRUVlfqVZ599tq+vLzc3Nzs7u6qqSko5ZcoUt9stpezr6+vq6pJShoWF9ff3e8wWEhKidXO5XJMmTfIepfWcPHmyy+XSuk2ePFlKaTKZOjs7tUmefvpp74JDQkJSU1NtNltWVlZzc7M+VXd394EDB9avXx8WFqb1NJzKVwB7VOgxm//1R0VFaT0fPnwYGhqqtXics/QRwMPcmpTys88++8EPfvDll18ajgoJCdFWMZlM2lfmcQiGJQ1xjN7bl1LW19dnZGRIKVevXn3+/HmtsaGh4fnnn29vb5cA8E0xmgH86aef/vCHP4yIiHjw4IGUsr+/v7q6WrtVXV29ZMmSvLy8iIgI7e9cwxn067CwMO2vb5fLNXXqVF+jIiMjPf4GHz9+vOHMQzRqLRkZGQcOHLh586Y+g+FUvi48KvSYzf/6J06cqPV0u90hISHanN7nbBjAw9zaw4cPZ8+e/Y9//MNwC8M8BO+ShjhG7+1rZs2a5XQ658yZMzAwIKXs6emZOXOm9mwNAN8Yo/Yz4M7Ozg0bNqxfvz45OVn7Ud+ZM2eKi4udTmdqauqcOXMOHz5cWVmZmJh48uRJIcTBgwc3bdrka7a+vr7KykohxLFjx9LS0nyNSktLKy8vF0KUl5fb7XYhRGCg5456e3uHU/+VK1eWLVvmcrncbrfW4j3VEDwq9JjNn/o1SUlJ2gwVFRVSSiGExzn7v7Xi4uLMzMyEhARfo76WYUmGaw0MDAwMDHhvX7N48eJt27YlJiYGBARIKXNzc998883Zs2cPswwA+P/gZ4Brb3TtdntycvKJEyeklDdu3MjMzLTZbHPnzm1sbJRSbt++fcaMGQkJCbt3725oaNDfAGtvJg2fgM1mc25urtVqzcrKam9v9zWqtbU1MzPTarVmZmbeunXLcLYFCxYMLtj7CXjWrFm/+c1v3nrrrWnTpr366qv6s6avwgwvPCr0mM2f+jVNTU1Wq9VqtW7YsEFr9z5nfS8j29rYsWOTkpK0F8j3798fYpSvC8OSDNdyOBwLFy703r6mvr4+KCjowoULUsqSkpKwsDCtqoULF0oA+Kbw99eQHpMn9vdnAAAYFfxPWAAAKPCEPgEDAPDNxhMwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAgQwAAAKEMAAAChAAAMAoAABDACAAv8Fu+AiwqiY2qoAAAAASUVORK5CYII=";

// ═══════════════════════════════════════════════════════════════
describe("extract-event — integración real con Gemini", () => {
  //   it.skipIf(!hasGeminiKey)(
  //     'OMITIDO: configura GEMINI_API_KEY para ejecutar (ver instrucciones arriba)',
  //     () => { /* nunca se ejecuta, solo muestra mensaje */ }
  //   )

  it.runIf(hasGeminiKey)(
    "Tiempo y respuesta de latencia de Gemini y extracción de evento",
    async () => {
      // Resetear módulos para que genAI se inicialice con la key disponible
      vi.resetModules();
      const { POST } = await import("../app/api/extract-event/route");

      // Construir el request con imagen PNG real
      const imageBuffer = Buffer.from(TEST_IMAGE_BASE64, "base64");
      const imageBlob = new Blob([imageBuffer], { type: "image/png" });
      const formData = new FormData();
      formData.append("imagen", imageBlob, "evento-prueba.png");

      const mockRequest = {
        cookies: { getAll: vi.fn(() => []), set: vi.fn() },
        formData: async () => formData,
      } as any;

      // ── Medición de latencia real ──────────────────────────────
      console.log("\n⏱  Iniciando llamada real a Gemini API...");
      const start = performance.now();
      const response = await POST(mockRequest) as any;
      const duration = performance.now() - start;

      // ── Reporte de métricas ────────────────────────────────────
      console.log(`✅ Latencia total:   ${Math.round(duration)} ms`);
      //console.log(`📊 Límite configurado:   ${MAX_LATENCY_MS} ms`);
      console.log(`📦 Status HTTP:   ${response.status}`);
      console.log(
        `🤖 Respuesta del modelo:`,
        JSON.stringify(response.data, null, 2),
      );

      // ── Assertions de latencia ─────────────────────────────────
      expect(
        duration,
        `Latencia (${Math.round(duration)}ms) superó el límite de ${MAX_LATENCY_MS}ms`,
      ).toBeLessThan(MAX_LATENCY_MS);

      expect(
        duration,
        "Respuesta instantánea — ¿se llamó realmente a la API?",
      ).toBeGreaterThan(200);

      // ── Assertions de estructura ───────────────────────────────
      expect(
        response.status,
        `El route devolvió ${response.status} en lugar de 200. Revisa stderr arriba.`,
      ).toBe(200);

      expect(response.data).toHaveProperty("source", "ai_image");
      expect(response.data).toHaveProperty("titulo");
      expect(response.data).toHaveProperty("fecha");
      expect(response.data).toHaveProperty("hora");
      expect(response.data).toHaveProperty("descripcion");

      // Verificar que Gemini extrajo algo coherente
      if (response.data.titulo !== null) {
        expect(typeof response.data.titulo).toBe("string");
        expect((response.data.titulo as string).length).toBeGreaterThan(0);
      }
    },
    MAX_LATENCY_MS + 5000, // timeout de Vitest para este test
  );
});
