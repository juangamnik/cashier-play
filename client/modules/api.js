const api = {
    // Article-related logic
    async getArticleMap() {
        try {
            const articles = await api.getDataByBusiness('real');
            return articles.reduce((acc, article) => {
                acc[article.article_num] = { id: article.id, name: article.name, price: article.price };
                return acc;
            }, {});
        } catch (error) {
            console.error("Fehler beim Abrufen der Artikel:", error.message);
            return {};
        }
    },
    // Article-related logic
    async getArticleList() {
        try {
            const articles = await api.getDataByBusiness('real');
            return articles.map(article => ({
                id: article.article_num,
                primary_id: article.id,
                name: article.name,
                price: article.price
            }));
        } catch (error) {
            console.error("Fehler beim Abrufen der Artikel:", error.message);
            return [];
        }
    },
    async addArticle(article) {
        try {
            await api.addData(
                JSON.stringify({ name: article.name, price: article.price, vat: article.vat || 'C' }),
                article.article_num,
                'real'
            );
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Artikels:", error.message);
        }
    },
    async editArticle(articleNum, updatedData, id) {
        try {
            // Prepare data to be updated or added
            const payload = {
                id,
                article_num: articleNum,
                value: JSON.stringify({
                    name: updatedData.name,
                    price: updatedData.price,
                    vat: updatedData.vat || 'C'
                }),
                business: 'real'
            };
    
            // API call for editing or adding
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                throw new Error(`Fehler beim Bearbeiten des Artikels: ${response.statusText}`);
            }
    
            return await response.json();
        } catch (error) {
            console.error("Fehler beim Bearbeiten des Artikels:", error.message);
        }
    },
    async deleteArticleByArticleNum(articleNum) {
        try {
            const response = await fetch(`/api/data/article/${encodeURIComponent(articleNum)}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);
        } catch (error) {
            console.error("Fehler beim Löschen des Artikels:", error.message);
        }
    },
    async deleteArticlesByBusiness(business) {
        try {
            const response = await fetch(`/api/data/business/${encodeURIComponent(business)}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);
        } catch (error) {
            console.error("Fehler beim Löschen der Artikel für das Business:", error.message);
        }
    },
    // General data logic
    async addData(value, articleNum, business) {
        const response = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value, article_num: articleNum, business })
        });
        if (!response.ok) throw new Error(`Fehler beim Hinzufügen der Daten: ${response.statusText}`);
        return response.json();
    },
    async getDataByBusiness(business) {
        const response = await fetch(`/api/data/business/${encodeURIComponent(business)}`);
        if (!response.ok) throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
        const data = await response.json();

        // Parse and validate the value field
        return data.map(item => {
            let parsedValue;
            try {
                parsedValue = JSON.parse(item.value);
            } catch (e) {
                parsedValue = {}; // Fallback for JSON errors
            }

            return {
                id: item.id,
                article_num: item.article_num,
                business: item.business,
                name: parsedValue.name || "Unbenannt",
                price: parsedValue.price || 0,
                vat: parsedValue.vat || "C"
            };
        });
    },
    async getAllData() {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error(`Fehler beim Abrufen aller Daten: ${response.statusText}`);
        const data = await response.json();

        // Parse and validate the value field
        return data.map(item => {
            let parsedValue;
            try {
                parsedValue = JSON.parse(item.value);
            } catch (e) {
                parsedValue = {}; // Fallback for JSON errors
            }

            return {
                id: item.id,
                article_num: item.article_num,
                business: item.business,
                name: parsedValue.name || "Unbenannt",
                price: parsedValue.price || 0,
                vat: parsedValue.vat || "C"
            };
        });
    },
    async deleteData(id) {
        const response = await fetch(`/api/data/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Fehler beim Löschen der Daten: ${response.statusText}`);
        return response.text();
    },
    async lookupArticle(artikelnummer) {
        try {
            const response = await fetch('/lookup-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artikelnummer }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Unbekannter Fehler bei der Anfrage");
            }

            return await response.json();
        } catch (error) {
            console.error("Fehler im API-Lookup:", error.message);
            throw error;
        }
    }
};

export { api };