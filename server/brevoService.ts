import fetch from 'node-fetch';

interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    SMS?: string;
  };
  listIds?: number[];
}

interface BrevoEmailTemplate {
  templateId: number;
  to: Array<{
    email: string;
    name?: string;
  }>;
  params?: Record<string, any>;
}

class BrevoService {
  private apiKey: string;
  private baseUrl = 'https://api.brevo.com/v3';

  constructor() {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY environment variable is required');
    }
    this.apiKey = process.env.BREVO_API_KEY;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async addContact(contact: BrevoContact) {
    try {
      return await this.makeRequest('/contacts', 'POST', contact);
    } catch (error) {
      console.error('Error adding contact to Brevo:', error);
      throw error;
    }
  }

  async sendTransactionalEmail(emailData: any) {
    try {
      return await this.makeRequest('/smtp/email', 'POST', emailData);
    } catch (error) {
      console.error('Error sending transactional email:', error);
      throw error;
    }
  }

  async sendScavengerHuntWelcomeEmail(email: string, firstName?: string) {
    try {
      const emailData = {
        sender: {
          name: "Ocks on the Block",
          email: "info@ocksontheblock.com"
        },
        to: [
          {
            email: email,
            name: firstName || "Hunter"
          }
        ],
        subject: "🏆 You're In! Welcome to the Hunt",
        htmlContent: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; padding: 0;">
            <div style="background: linear-gradient(135deg, #ff5722 0%, #000 100%); padding: 2px;">
              <div style="background-color: #fff; margin: 0;">
                
                <!-- Header -->
                <div style="background-color: #000; color: #fff; padding: 30px 20px; text-align: center;">
                  <h1 style="color: #ff5722; font-size: 32px; margin: 0 0 10px 0; font-weight: 900; letter-spacing: -1px;">
                    Welcome to New York City's Biggest Scavenger Hunt
                  </h1>
                  <p style="color: #fff; font-size: 18px; margin: 0; font-weight: 300;">
                    Hosted by Ocks on the Block 🗽
                  </p>
                </div>
                
                <!-- Body -->
                <div style="padding: 30px 20px; background-color: #fff;">
                  <div style="margin-bottom: 30px;">
                    <p style="color: #333; font-size: 18px; line-height: 1.5; margin: 0 0 20px 0; font-weight: 500;">
                      You just joined the hunt that's about to take over all 5 boroughs.
                    </p>
                    
                    <p style="color: #333; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                      Here's what's ahead:
                    </p>
                    
                    <ul style="color: #333; font-size: 16px; line-height: 1.8; margin: 0; padding-left: 20px; list-style: none;">
                      <li style="margin-bottom: 8px;">🎁 <strong>Mystery Boxes dropping soon</strong> — unlock your Ock figurines</li>
                      <li style="margin-bottom: 8px;">📍 <strong>Verified corner store locations</strong> across NYC</li>
                      <li style="margin-bottom: 8px;">🏆 <strong>A $10,000 prize</strong> for the first player to complete the hunt</li>
                    </ul>
                  </div>
                  
                  <div style="background-color: #ff5722; color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
                    <p style="margin: 0; font-size: 16px; font-weight: 500;">
                      Stay locked in — we'll be sending you updates, hints, and instructions straight to your inbox.
                    </p>
                  </div>
                  
                  <!-- CTA Button -->
                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="https://ocksontheblock.com/buy-ocks" style="background-color: #ff5722; color: #fff; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                      👉 Start the Hunt
                    </a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 25px 20px; text-align: center; border-top: 3px solid #ff5722;">
                  <p style="color: #333; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                    Follow us for live hints, drops, and behind-the-scenes action:
                  </p>
                  <p style="color: #ff5722; font-size: 18px; margin: 0; font-weight: 700;">
                    @ocksontheblock on TikTok & Instagram
                  </p>
                  
                  <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px; margin: 0;">
                      You're in the hunt because you signed up. Time to make NYC history. 🏆
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        `,
        textContent: `
🏆 You're In! Welcome to the Hunt

Welcome to New York City's Biggest Scavenger Hunt — Hosted by Ocks on the Block 🗽

You just joined the hunt that's about to take over all 5 boroughs.

Here's what's ahead:
• 🎁 Mystery Boxes dropping soon — unlock your Ock figurines
• 📍 Verified corner store locations across NYC  
• 🏆 A $10,000 prize for the first player to complete the hunt

Stay locked in — we'll be sending you updates, hints, and instructions straight to your inbox.

👉 Start the Hunt: https://ocksontheblock.com/buy-ocks

Follow us on TikTok and Instagram @ocksontheblock for live hints, drops, and behind-the-scenes action.

You're in the hunt because you signed up. Time to make NYC history. 🏆
        `
      };

      return await this.sendTransactionalEmail(emailData);
    } catch (error) {
      console.error('Error sending scavenger hunt welcome email:', error);
      throw error;
    }
  }

  async addScavengerHuntContact(email: string, firstName?: string, lastName?: string) {
    try {
      const contact: BrevoContact = {
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
        },
        // Add to your scavenger hunt contact list (you'll need to create this list in Brevo)
        // listIds: [1] // Replace with your actual Brevo list ID
      };

      return await this.addContact(contact);
    } catch (error) {
      console.error('Error adding scavenger hunt contact:', error);
      throw error;
    }
  }
}

export const brevoService = new BrevoService();