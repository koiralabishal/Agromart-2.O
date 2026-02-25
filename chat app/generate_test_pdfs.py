from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_pdf(filename, title, content):
    if not os.path.exists('data'):
        os.makedirs('data')
    
    path = os.path.join('data', filename)
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, height - 72, title)
    
    # Content
    c.setFont("Helvetica", 10)
    text = c.beginText(72, height - 100)
    text.setLeading(14)
    
    # Split content into lines and handle wrapping roughly
    for line in content.split('\n'):
        # Basic manual wrapping if line too long
        if len(line) > 90:
            words = line.split(' ')
            current_line = ""
            for word in words:
                if len(current_line + word) < 90:
                    current_line += word + " "
                else:
                    text.textLine(current_line.strip())
                    current_line = word + " "
            text.textLine(current_line.strip())
        else:
            text.textLine(line)
            
        # Check if we need a new page (rough estimate)
        if text.getY() < 72:
            c.drawText(text)
            c.showPage()
            text = c.beginText(72, height - 72)
            text.setFont("Helvetica", 10)
            text.setLeading(14)
            
    c.drawText(text)
    c.save()
    print(f"Created {path}")

# Detailed Apple Content
apple_content = """
1. Crop Overview
Apple is one of the most important temperate fruit crops cultivated in hilly and mountainous regions. It is valued for its nutritional quality, long storage life, and high market demand. Apples are rich in dietary fiber, vitamins, and antioxidants, making them a popular fruit for both fresh consumption and processing.
Apple cultivation is generally practiced in regions with cold winters and mild summers. The crop requires careful management, particularly pruning, nutrient application, and disease control, to achieve good yield and quality.

2. Climatic Requirement
Apple requires a cool temperate climate for successful cultivation.
Ideal temperature range: 18–24°C
Requires 800–1,200 chilling hours (below 7°C) during winter for proper bud break and flowering
Excessive heat during summer affects fruit color and quality
Frost during flowering can cause severe yield loss
Moderate rainfall is beneficial, but excessive rain may promote fungal diseases

3. Soil Requirement
Apple grows best in deep, fertile, and well-drained soils.
Preferred soil type: Loamy or sandy loam
Soil pH: 5.5–6.5
Soil should be rich in organic matter
Poor drainage and waterlogging cause root diseases
Light-textured soils require more frequent irrigation and fertilization

4. Cultivation Practices
Land Preparation: Land should be deeply ploughed and leveled. Pits of size 1 m × 1 m × 1 m are dug. Pits are filled with topsoil mixed with FYM before planting.
Propagation: Apple is propagated by grafting or budding. Rootstocks influence tree size, yield, and disease resistance.
Planting: Planting season: December to February. Spacing: 4–5 meters between plants. Young plants require staking for support.
Pruning & Training: Regular pruning is essential to maintain tree shape. Removes dead, diseased, and overcrowded branches. Improves light penetration and air circulation.

5. Fertilizer Management
Proper nutrient management is essential for apple productivity.
Farmyard manure (FYM): 20–30 kg per plant per year
Nitrogen (N): 70–100 g per plant
Phosphorus (P): 35–50 g per plant
Potassium (K): 70–100 g per plant
Fertilizers are applied in split doses, usually before flowering and after fruit set. Excess nitrogen should be avoided as it promotes vegetative growth over fruiting.

6. Common Diseases & Pests
Diseases:
- Apple scab: Causes dark spots on leaves and fruits
- Powdery mildew: White powdery growth on shoots and leaves
- Fire blight: Causes wilting and blackening of shoots
Pests:
- Woolly aphid, Codling moth, San Jose scale
Integrated pest management practices help reduce crop losses.

7. Harvesting
Harvesting period: August–October. Fruits are harvested when they reach proper size, color, and firmness. Hand picking is recommended to avoid bruising. Harvested fruits are graded before storage or marketing.

8. Market Price Information
Average farm-gate price generally ranges between NPR 150–300 per kg. Prices vary depending on Variety, Fruit quality, Season, Market demand, and Transportation distance.
"""

# Detailed Cabbage Content
cabbage_content = """
1. Crop Overview
Cabbage is a popular leafy vegetable grown for its compact head. It is widely consumed as a cooked vegetable and salad ingredient. Cabbage is rich in vitamins, minerals, and dietary fiber and plays an important role in household nutrition and commercial vegetable farming.
The crop is well-suited for cool seasons and is commonly grown by small and medium farmers due to its high yield potential and steady market demand.

2. Climatic Requirement
Cabbage grows best in a cool and moist climate.
Optimal temperature: 15–20°C
High temperatures cause loose head formation
Extremely cold conditions may slow growth
Adequate sunlight is required for proper head development

3. Soil Requirement
Best suited to well-drained loamy soil
Soil pH: 6.0–6.8
Soil should be rich in organic matter
Heavy clay soils should be avoided due to poor drainage

4. Cultivation Practices
Nursery Raising: Seeds are raised in nursery beds. Seedlings are ready for transplanting in 4–5 weeks.
Transplanting: Spacing: 45 cm × 45 cm. Transplanting is done in the evening to reduce stress. Irrigation is provided immediately after transplanting.
Field Management: Regular weeding is required. Irrigation is critical during head formation stage. Mulching helps retain moisture and control weeds.

5. Fertilizer Management
Balanced fertilization ensures healthy head development.
Farmyard manure (FYM): 20–25 tons per hectare
Nitrogen (N): 120 kg/ha
Phosphorus (P): 60 kg/ha
Potassium (K): 60 kg/ha
Nitrogen is applied in split doses to avoid excessive leaf growth.

6. Common Diseases & Pests
Diseases:
- Black rot: Causes yellowing and wilting of leaves
- Downy mildew: Grey fungal growth on leaves
- Club root: Swollen roots leading to poor growth
Pests:
- Cabbage butterfly, Aphids, Cutworms
Crop rotation and timely pest control reduce infestation.

7. Harvesting
Harvesting is done 90–120 days after transplanting. Heads should be firm and compact. Delayed harvesting may cause head cracking. Harvested heads are trimmed and cleaned before sale.

8. Market Price Information
Average farm-gate price generally ranges between NPR 40–80 per kg. Prices fluctuate depending on Season, Supply volume, Market location, and Quality of produce.
"""

create_pdf("apple_guide.pdf", "APPLE (Malus domestica) – COMPLETE AGRICULTURAL GUIDE", apple_content)
create_pdf("cabbage_guide.pdf", "CABBAGE (Brassica oleracea var. capitata) – COMPLETE AGRICULTURAL GUIDE", cabbage_content)
