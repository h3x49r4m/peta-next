use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug)]
pub struct FrontMatter {
    pub title: String,
    pub date: String,
    pub tags: Vec<String>,
    #[serde(default)]
    pub author: String,
    #[serde(default)]
    pub snippet_id: String,
    #[serde(default)]
    pub github_url: String,
    #[serde(default)]
    pub demo_url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ContentBlock {
    #[serde(rename = "type")]
    pub block_type: String,
    pub content: String,
    #[serde(default)]
    pub id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParsedDocument {
    pub frontmatter: FrontMatter,
    pub content: Vec<ContentBlock>,
    #[serde(default)]
    pub snippet_refs: Vec<String>,
}

#[wasm_bindgen]
pub struct RstParser {
    // Parser state can be stored here if needed
}

#[wasm_bindgen]
impl RstParser {
    #[wasm_bindgen(constructor)]
    pub fn new() -> RstParser {
        RstParser {}
    }

    #[wasm_bindgen]
    pub fn parse(&self, rst_content: &str) -> String {
        let parsed = self.parse_rst(rst_content);
        serde_json::to_string(&parsed).unwrap()
    }

    fn parse_rst(&self, content: &str) -> ParsedDocument {
        let lines: Vec<&str> = content.lines().collect();
        let mut frontmatter_end = 0;
        let mut in_frontmatter = false;
        let mut frontmatter_str = String::new();
        let mut content_blocks = Vec::new();
        let mut snippet_refs = Vec::new();

        // Parse frontmatter
        for (i, line) in lines.iter().enumerate() {
            if line.trim() == "---" {
                if !in_frontmatter {
                    in_frontmatter = true;
                    continue;
                } else {
                    frontmatter_end = i;
                    break;
                }
            }
            if in_frontmatter {
                frontmatter_str.push_str(line);
                frontmatter_str.push('\n');
            }
        }

        let frontmatter = self.parse_frontmatter(&frontmatter_str);

        // Parse content
        let mut current_block = String::new();
        let mut in_directive = false;
        let mut directive_content = String::new();
        let mut directive_type = String::new();

        for line in lines.iter().skip(frontmatter_end + 1) {
            if line.starts_with(".. snippet-card::") {
                // Save current text block if exists
                if !current_block.trim().is_empty() {
                    content_blocks.push(ContentBlock {
                        block_type: "text".to_string(),
                        content: current_block.trim().to_string(),
                        id: String::new(),
                    });
                    current_block.clear();
                }

                // Start snippet directive
                in_directive = true;
                directive_type = "snippet-card".to_string();
                let snippet_id = line.trim_start_matches(".. snippet-card::").trim();
                snippet_refs.push(snippet_id.to_string());
                directive_content.clear();
            } else if in_directive {
                if line.starts_with("   ") || line.trim().is_empty() {
                    directive_content.push_str(line);
                    directive_content.push('\n');
                } else {
                    // End of directive
                    in_directive = false;
                    content_blocks.push(ContentBlock {
                        block_type: format!("{}-ref", directive_type),
                        content: snippet_refs.last().unwrap().clone(),
                        id: String::new(),
                    });
                    
                    // Add the directive content as text
                    if !directive_content.trim().is_empty() {
                        content_blocks.push(ContentBlock {
                            block_type: "text".to_string(),
                            content: directive_content.trim().to_string(),
                            id: String::new(),
                        });
                    }
                    
                    // Add current line to new text block
                    current_block.push_str(line);
                    current_block.push('\n');
                }
            } else {
                current_block.push_str(line);
                current_block.push('\n');
            }
        }

        // Add final text block if exists
        if !current_block.trim().is_empty() {
            content_blocks.push(ContentBlock {
                block_type: "text".to_string(),
                content: current_block.trim().to_string(),
                id: String::new(),
            });
        }

        ParsedDocument {
            frontmatter,
            content: content_blocks,
            snippet_refs,
        }
    }

    fn parse_frontmatter(&self, frontmatter_str: &str) -> FrontMatter {
        // Simple YAML parsing for demonstration
        // In production, use a proper YAML parser
        let mut frontmatter = FrontMatter {
            title: String::new(),
            date: String::new(),
            tags: Vec::new(),
            author: String::new(),
            snippet_id: String::new(),
            github_url: String::new(),
            demo_url: String::new(),
        };

        for line in frontmatter_str.lines() {
            if let Some(key_value) = line.split_once(':') {
                let key = key_value.0.trim();
                let value = key_value.1.trim();

                match key {
                    "title" => frontmatter.title = value.trim_matches('"').to_string(),
                    "date" => frontmatter.date = value.trim_matches('"').to_string(),
                    "author" => frontmatter.author = value.trim_matches('"').to_string(),
                    "snippet_id" => frontmatter.snippet_id = value.trim_matches('"').to_string(),
                    "github_url" => frontmatter.github_url = value.trim_matches('"').to_string(),
                    "demo_url" => frontmatter.demo_url = value.trim_matches('"').to_string(),
                    "tags" => {
                        let tags_str = value.trim_matches(['[', ']']);
                        frontmatter.tags = tags_str
                            .split(',')
                            .map(|tag| tag.trim().trim_matches('"').to_string())
                            .collect();
                    }
                    _ => {}
                }
            }
        }

        frontmatter
    }
}