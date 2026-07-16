/// Shared data model types used across commands and services.
use serde::{Deserialize, Serialize};

pub const MIN_CHARACTERS: usize = 126;
pub const MIN_IMAGES: usize = 591;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub variants: u32,
    pub files: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Manifest {
    pub version: u32,
    pub source: String,
    #[serde(rename = "missingIds")]
    pub missing_ids: Vec<String>,
    pub characters: Vec<Character>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FavoritesFile {
    pub favorites: Vec<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct DownloadProgress {
    pub completed: usize,
    pub total: usize,
    pub current_file: String,
    pub phase: String,
}

#[derive(Debug, Deserialize)]
pub struct IdNameEntry {
    pub names: Option<Vec<String>>,
    pub variants: Option<u32>,
}
