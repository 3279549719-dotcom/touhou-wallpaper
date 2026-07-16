/// Manifest download builder — fetch id-name.json and build manifest.
use crate::models::types::IdNameEntry;
use crate::services::http::pad_id;

const BASE_URL: &str = "https://thpdp.ver.moe";
const ID_MIN: i32 = 1;
const ID_MAX: i32 = 131;

pub fn build_manifest(raw: &serde_json::Map<String, serde_json::Value>) -> serde_json::Value {
    let mut keys: Vec<&String> = raw.keys().collect();
    keys.sort_by_key(|k| k.parse::<i32>().unwrap_or(0));

    let mut characters = Vec::new();
    for key in keys {
        if !key.chars().all(|c| c.is_ascii_digit()) {
            continue;
        }
        let num: i32 = key.parse().unwrap_or(0);
        if num < ID_MIN || num > ID_MAX {
            continue;
        }
        let cid = pad_id(key);
        let entry: IdNameEntry =
            serde_json::from_value(raw[key].clone()).unwrap_or(IdNameEntry {
                names: None,
                variants: None,
            });
        let variants = entry.variants.unwrap_or(0);
        let name = entry
            .names
            .as_ref()
            .and_then(|n| n.first())
            .cloned()
            .unwrap_or_default();
        let files: Vec<String> = (0..variants)
            .map(|i| format!("{cid}_{:02}", i))
            .collect();
        characters.push(serde_json::json!({
            "id": cid,
            "name": name,
            "variants": variants,
            "files": files,
        }));
    }

    serde_json::json!({
        "version": 1,
        "source": BASE_URL,
        "missingIds": ["011", "013", "024", "028", "034"],
        "characters": characters,
    })
}
